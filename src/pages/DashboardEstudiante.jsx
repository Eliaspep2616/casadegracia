import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { BookOpen, CheckCircle, Clock, ArrowRight, LogOut } from 'lucide-react';
import './DashboardEstudiante.css';

const DashboardEstudiante = () => {
  const navigate = useNavigate();
  const estudiante = { nombre: "MATEO" };
  const metricas = { promedio: "92/100", progreso: "45%" };
  
  const modulos = [
    { 
      id: 1, 
      titulo: "Liderazgo I: Fundamentos", 
      profesor: "Ps. Juan Pérez",
      estado: "En curso", 
      tareasPendientes: 2, 
      estiloTema: "modulo-dark" 
    },
    { 
      id: 2, 
      titulo: "Cultura del Reino", 
      profesor: "Ps. María Gómez",
      estado: "Completado", 
      tareasPendientes: 0, 
      estiloTema: "modulo-light" 
    }
  ];

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate('/Academia-lideres');
  };

  return (
    <div className="dash-page-container">
      <div className="dash-main-wrapper">
        
        {/* Modificamos la cabecera para que sea flex y contenga el botón */}
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
            {modulos.map((mod) => (
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
                  <button className="btn-entrar-clase">
                    IR A CLASE <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default DashboardEstudiante;