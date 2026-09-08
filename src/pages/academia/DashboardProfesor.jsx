import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { Users, FileText, RefreshCw, ArrowRight, LogOut, BookOpen } from 'lucide-react';
import './DashboardProfesor.css';

const DashboardProfesor = () => {
  const navigate = useNavigate();
  const [sincronizando, setSincronizando] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [profesor, setProfesor] = useState({ nombre: "CARGANDO..." });
  const [clases, setClases] = useState([]);
  const [metricasGlobales, setMetricasGlobales] = useState({ alumnos: 0, tareasPorCalificar: 0 });

  useEffect(() => {
    const cargarDashboard = async () => {
      setLoading(true);
      
      // 1. Verificar sesión del profesor
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        navigate('/Academia-lideres');
        return;
      }
      
      const userId = session.user.id;

      // 2. Obtener nombre del profesor
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('nombre_completo')
        .eq('id', userId)
        .single();

      if (perfil) {
        const primerNombre = perfil.nombre_completo.split(' ')[0];
        setProfesor({ nombre: primerNombre.toUpperCase() });
      }

      // 3. Buscar las materias asignadas a este profesor
      const { data: materiasData } = await supabase
        .from('materias')
        .select('id, nombre_materia, nivel_id')
        .eq('profesor_id', userId);

      if (materiasData && materiasData.length > 0) {
        let totalAlumnosGlobal = 0;
        let totalTareasPendientes = 0;
        const clasesProcesadas = [];

        // Procesar las estadísticas para cada materia
        for (const materia of materiasData) {
          // Contar alumnos inscritos en el nivel de esta materia
          const { count: alumnosCount } = await supabase
            .from('matriculas')
            .select('id', { count: 'exact', head: true })
            .eq('nivel_id', materia.nivel_id)
            .eq('estado', 'activo');

          // Contar entregas sin calificar de esta materia
          // Primero buscamos los IDs de las tareas de esta materia
          const { data: tareasMateria } = await supabase
            .from('tareas')
            .select('id')
            .eq('materia_id', materia.id);

          let pendientesMateria = 0;
          if (tareasMateria && tareasMateria.length > 0) {
            const idsTareas = tareasMateria.map(t => t.id);
            const { count: entregasCount } = await supabase
              .from('entregas_tareas')
              .select('id', { count: 'exact', head: true })
              .in('tarea_id', idsTareas)
              .is('calificacion', null); // Solo las que no tienen nota
            
            pendientesMateria = entregasCount || 0;
          }

          clasesProcesadas.push({
            id: materia.id,
            titulo: materia.nombre_materia,
            alumnosInscritos: alumnosCount || 0,
            entregasPendientes: pendientesMateria
          });

          totalAlumnosGlobal += (alumnosCount || 0);
          totalTareasPendientes += pendientesMateria;
        }

        setClases(clasesProcesadas);
        setMetricasGlobales({ alumnos: totalAlumnosGlobal, tareasPorCalificar: totalTareasPendientes });
      }
      
      setLoading(false);
    };

    cargarDashboard();
  }, [navigate]);

  const handleSincronizarGlobal = () => {
    setSincronizando(true);
    // Como ahora todo es en tiempo real con Supabase, este botón es más visual,
    // pero podemos usarlo para recargar los datos
    setTimeout(() => {
      window.location.reload();
    }, 1000); 
  };

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate('/Academia-lideres');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Montserrat', backgroundColor: '#f1f1f1' }}>
        <h2>Cargando Panel Docente...</h2>
      </div>
    );
  }

  return (
    <div className="prof-page-container">
      <div className="prof-main-wrapper">
        
        <header className="prof-header">
          <div>
            <p className="prof-subtitle">PANEL DOCENTE</p>
            <h1 className="prof-title">HOLA,<br/>{profesor.nombre}</h1>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button 
              className="btn-sync-global" 
              onClick={handleSincronizarGlobal}
              disabled={sincronizando}
            >
              <RefreshCw size={18} className={sincronizando ? "animate-spin" : ""} />
              {sincronizando ? 'ACTUALIZANDO...' : 'RECARGAR DATOS'}
            </button>

            <button 
              onClick={handleCerrarSesion}
              title="Cerrar Sesión"
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                width: '50px', height: '50px', borderRadius: '50%', 
                backgroundColor: '#ffeaea', color: '#dc2626', border: 'none', 
                cursor: 'pointer', transition: 'all 0.3s' 
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; e.currentTarget.style.color = 'white'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffeaea'; e.currentTarget.style.color = '#dc2626'; }}
            >
              <LogOut size={20} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        <section className="prof-metrics-grid">
          <div className="prof-metric-card dark-card">
            <div className="metric-icon-prof"><Users size={24} strokeWidth={2.5} /></div>
            <div>
              <p className="metric-label-prof">TOTAL ALUMNOS</p>
              <h2 className="metric-value-prof">{metricasGlobales.alumnos}</h2>
            </div>
          </div>
          
          <div className="prof-metric-card alert-card">
            <div className="metric-icon-prof"><FileText size={24} strokeWidth={2.5} /></div>
            <div>
              <p className="metric-label-prof">POR CALIFICAR</p>
              <h2 className="metric-value-prof">{metricasGlobales.tareasPorCalificar}</h2>
            </div>
          </div>
        </section>

        <section className="prof-classes-section">
          <div className="section-header-flex">
            <h3 className="section-heading">TUS CLASES ASIGNADAS</h3>
          </div>
          
          <div className="classes-grid">
            {clases.length === 0 ? (
              <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '20px', color: '#777', fontWeight: '600' }}>
                No tienes materias asignadas actualmente.
              </div>
            ) : (
              clases.map((clase) => (
                <div key={clase.id} className="prof-class-card">
                  <div className="class-card-header">
                    <span style={{ display: 'inline-block', backgroundColor: '#f1f1f1', padding: '5px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '10px' }}>
                      PERIODO ACTUAL
                    </span>
                    <h4 className="class-title">{clase.titulo}</h4>
                  </div>
                  
                  <div className="class-stats">
                    <div className="stat-item">
                      <strong>{clase.alumnosInscritos}</strong>
                      <span>Estudiantes</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item highlight">
                      <strong>{clase.entregasPendientes}</strong>
                      <span style={{ color: clase.entregasPendientes > 0 ? '#b45309' : '#777' }}>Por Calificar</span>
                    </div>
                  </div>
                  
                  <div className="class-card-footer">
                    {/* 👇 AQUÍ ESTÁ LA MAGIA: Al hacer clic nos lleva al PanelClaseProfesor */}
                    <button 
                      className="btn-outline-dark"
                      onClick={() => navigate(`/admin-clase/${clase.id}`)}
                    >
                      GESTIONAR CLASE <ArrowRight size={16} />
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

export default DashboardProfesor;