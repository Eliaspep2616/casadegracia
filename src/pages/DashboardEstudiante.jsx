import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { BookOpen, CheckCircle, Clock, ArrowRight, LogOut } from 'lucide-react';
import './DashboardEstudiante.css';

const DashboardEstudiante = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [estudiante, setEstudiante] = useState({ nombre: "CARGANDO..." });
  const [modulos, setModulos] = useState([]);
  
  // Métricas estáticas por ahora (se calcularán después con las tareas reales)
  const metricas = { promedio: "0/100", progreso: "0%" };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // 1. Obtener la sesión del usuario que acaba de loguearse
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          navigate('/Academia-lideres');
          return;
        }
        
        const userId = session.user.id;

        // 2. Buscar su nombre real en la tabla "perfiles"
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('nombre_completo')
          .eq('id', userId)
          .single();

        if (perfil && perfil.nombre_completo) {
          // Extraemos solo el primer nombre (ej. "Mateo" de "Mateo Vera")
          const primerNombre = perfil.nombre_completo.split(' ')[0];
          setEstudiante({ nombre: primerNombre.toUpperCase() });
        }

        // 3. Buscar en qué Nivel está matriculado este alumno
        const { data: matricula } = await supabase
          .from('matriculas')
          .select('nivel_id')
          .eq('estudiante_id', userId)
          .single();

        // 4. Si está matriculado, traer las materias de ese nivel
        if (matricula) {
          const { data: materiasData } = await supabase
            .from('materias')
            .select(`
              id,
              nombre_materia,
              profesor:perfiles(nombre_completo)
            `)
            .eq('nivel_id', matricula.nivel_id);

          if (materiasData) {
            // Formateamos los datos para que el diseño visual siga siendo el mismo
            const modulosListos = materiasData.map((materia, index) => ({
              id: materia.id,
              titulo: materia.nombre_materia,
              profesor: materia.profesor ? `Ps. ${materia.profesor.nombre_completo}` : "Profesor por asignar",
              estado: "En curso",
              tareasPendientes: 0,
              // Intercalamos el color de las tarjetas automáticamente
              estiloTema: index % 2 === 0 ? "modulo-dark" : "modulo-light" 
            }));
            
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
    navigate('/Academia-lideres');
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
            <p className="dash-subtitle">COHORTE 2026</p>
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
            <div className="metric-icon"><CheckCircle size={24} strokeWidth={2.5} /></div>
            <div>
              <p className="metric-label">PROMEDIO GENERAL</p>
              <h2 className="metric-value">{metricas.promedio}</h2>
            </div>
          </div>
          
          <div className="metric-card bg-blanco">
            <div className="metric-icon"><Clock size={24} strokeWidth={2.5} /></div>
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