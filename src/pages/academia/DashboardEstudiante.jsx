import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { BookOpen, CheckCircle, Clock, ArrowRight, LogOut, Award } from 'lucide-react';
import './DashboardEstudiante.css';

const DashboardEstudiante = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [estudiante, setEstudiante] = useState({ nombre: "CARGANDO..." });
  const [modulos, setModulos] = useState([]);
  
  // NUEVO: Métricas ahora son un estado dinámico
  const [metricas, setMetricas] = useState({ promedio: "0.00/100", progreso: "0%" });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          navigate('/login');
          return;
        }
        
        const userId = session.user.id;

        const { data: perfil } = await supabase
          .from('perfiles')
          .select('nombre_completo')
          .eq('id', userId)
          .single();

        if (perfil && perfil.nombre_completo) {
          const primerNombre = perfil.nombre_completo.split(' ')[0];
          setEstudiante({ nombre: primerNombre.toUpperCase() });
        }

        const { data: matricula } = await supabase
          .from('matriculas')
          .select('nivel_id')
          .eq('estudiante_id', userId)
          .single();

        if (matricula) {
          const { data: materiasData } = await supabase
            .from('materias')
            .select('id, nombre_materia, profesor:perfiles(nombre_completo)')
            .eq('nivel_id', matricula.nivel_id);

          if (materiasData && materiasData.length > 0) {
            const materiaIds = materiasData.map(m => m.id);

            // 1. Descargamos la estructura académica completa de todas sus materias
            const { data: unidadesData } = await supabase
              .from('unidades')
              .select('materia_id, actividades(id, categoria_id, tipo)')
              .in('materia_id', materiaIds);

            // 2. Descargamos las "Bolsas de Notas" (Categorías) de estas materias
            const { data: categoriasData } = await supabase
              .from('categorias_notas')
              .select('*')
              .in('materia_id', materiaIds);

            // 3. Descargamos todas las entregas/notas exclusivas de este alumno
            const { data: entregasData } = await supabase
              .from('entregas_tareas')
              .select('tarea_id, calificacion')
              .eq('estudiante_id', userId);

            let sumaPromediosGlobal = 0;
            let modulosConCalificacion = 0;
            let totalTareasGlobal = 0;
            let tareasCompletadasGlobal = 0;

            // 4. EL MOTOR MATEMÁTICO: Evaluamos materia por materia
            const modulosListos = materiasData.map((materia, index) => {
              const catMateria = categoriasData?.filter(c => c.materia_id === materia.id) || [];
              const unidMateria = unidadesData?.filter(u => u.materia_id === materia.id) || [];
              
              let notaFinalModulo = 0;
              let moduloTieneNotas = false;
              let tareasModulo = 0;
              let completadasModulo = 0;

              // Identificar todas las actividades calificables (tareas y foros)
              const todasLasActividades = unidMateria.flatMap(u => u.actividades).filter(a => a.tipo === 'tarea' || a.tipo === 'foro');
              tareasModulo = todasLasActividades.length;
              totalTareasGlobal += tareasModulo;

              // Recorremos las bolsas de evaluación (ej: 30% Deberes, 70% Examen)
              catMateria.forEach(cat => {
                const actividadesCat = todasLasActividades.filter(a => a.categoria_id == cat.id);
                if (actividadesCat.length === 0) return;

                let sumaNotasCat = 0;
                let tareasCalificadas = 0;

                actividadesCat.forEach(act => {
                  const entrega = entregasData?.find(e => e.tarea_id === act.id);
                  if (entrega) {
                    completadasModulo++;
                    tareasCompletadasGlobal++; // Sumamos para la barra de progreso general
                    if (entrega.calificacion != null) {
                      sumaNotasCat += Number(entrega.calificacion);
                      tareasCalificadas++;
                      moduloTieneNotas = true;
                    }
                  }
                });

                // Sacar promedio de la bolsa y multiplicarlo por su peso
                if (tareasCalificadas > 0) {
                  const promedioCat = sumaNotasCat / tareasCalificadas;
                  const aporteAlFinal = promedioCat * (Number(cat.porcentaje) / 100);
                  notaFinalModulo += aporteAlFinal;
                }
              });

              if (moduloTieneNotas) {
                sumaPromediosGlobal += notaFinalModulo;
                modulosConCalificacion++;
              }

              return {
                id: materia.id,
                titulo: materia.nombre_materia,
                profesor: materia.profesor ? `Ps. ${materia.profesor.nombre_completo}` : "Profesor por asignar",
                estado: "En curso",
                tareasPendientes: tareasModulo - completadasModulo,
                calificacionModulo: moduloTieneNotas ? notaFinalModulo.toFixed(2) : "-",
                estiloTema: index % 2 === 0 ? "modulo-dark" : "modulo-light" 
              };
            });

            // 5. Calculamos el Promedio General y el Progreso Académico Global
            const promedioGeneralFinal = modulosConCalificacion > 0 
              ? (sumaPromediosGlobal / modulosConCalificacion).toFixed(2) 
              : "0.00";
            
            const progresoPorcentaje = totalTareasGlobal > 0 
              ? Math.round((tareasCompletadasGlobal / totalTareasGlobal) * 100) 
              : 0;

            setMetricas({ 
              promedio: `${promedioGeneralFinal}/100`, 
              progreso: `${progresoPorcentaje}%` 
            });
            
            setModulos(modulosListos);
          }
        }
      } catch (error) {
        console.error("Error al cargar los datos del campus:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [navigate]);

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Montserrat', backgroundColor: '#f9f7f2' }}>
        <h2>Cargando tu campus...</h2>
      </div>
    );
  }

  return (
    <div className="dash-page-container">
      <div className="dash-main-wrapper">
        
        <header className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <p className="dash-subtitle">CAMPUS VIRTUAL</p>
            <h1 className="dash-title">HOLA,<br/>{estudiante.nombre}</h1>
          </div>

          <button 
            onClick={handleCerrarSesion}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', 
              padding: '12px 24px', borderRadius: '50px', 
              backgroundColor: 'transparent', color: '#1a1a1a', 
              border: '2px solid #1a1a1a', cursor: 'pointer', 
              fontWeight: '700', fontSize: '0.85rem', transition: 'all 0.3s' 
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1a1a1a'; e.currentTarget.style.color = 'white'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#1a1a1a'; }}
          >
            <LogOut size={18} />
            <span>SALIR</span>
          </button>
        </header>

        <section className="dash-metrics-grid">
          <div className="metric-card bg-crema">
            <div className="metric-icon"><Award size={24} strokeWidth={2.5} /></div>
            <div>
              <p className="metric-label">PROMEDIO GENERAL</p>
              <h2 className="metric-value">{metricas.promedio}</h2>
            </div>
          </div>
          
          <div className="metric-card bg-blanco">
            <div className="metric-icon"><CheckCircle size={24} strokeWidth={2.5} /></div>
            <div>
              <p className="metric-label">PROGRESO ACADÉMICO</p>
              <h2 className="metric-value">{metricas.progreso}</h2>
            </div>
          </div>
        </section>

        <section className="dash-modules-section">
          <h3 className="section-heading">TUS MÓDULOS</h3>
          
          <div className="modules-grid">
            {modulos.length === 0 ? (
              <div style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '20px', color: '#777', fontWeight: '500' }}>
                Aún no tienes materias asignadas en este nivel.
              </div>
            ) : (
              modulos.map((mod) => (
                <div key={mod.id} className={`module-card ${mod.estiloTema}`}>
                  <div className="module-content">
                    <span className="module-tag">{mod.estado}</span>
                    <h4 className="module-title">{mod.titulo}</h4>
                    <p className="module-teacher">{mod.profesor}</p>
                    
                    {/* NUEVO: Muestra la nota individual de la materia */}
                    <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 'bold', opacity: 0.8 }}>
                      <Award size={16} /> Nota actual: {mod.calificacionModulo} / 100
                    </div>
                  </div>
                  
                  <div className="module-footer">
                    <div className="module-tasks">
                      <BookOpen size={18} />
                      <span>
                        {mod.tareasPendientes === 0 
                          ? 'Todo al día' 
                          : `${mod.tareasPendientes} tareas pendientes`}
                      </span>
                    </div>
                    <button 
                      className="btn-entrar-clase"
                      onClick={() => navigate(`/clase/${mod.id}`)}
                    >
                      IR A CLASE <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default DashboardEstudiante;