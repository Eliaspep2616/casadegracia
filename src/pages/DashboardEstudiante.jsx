import React from 'react';
import { BookOpen, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import './DashboardEstudiante.css';

const DashboardEstudiante = () => {
  // Estos datos son "quemados" por ahora. 
  // En el futuro los traeremos de Google Classroom y Supabase.
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

  return (
    <div className="dash-page-container">
      <div className="dash-main-wrapper">
        
        {/* Cabecera Gigante */}
        <header className="dash-header">
          <p className="dash-subtitle">COHORTE 2026</p>
          <h1 className="dash-title">HOLA,<br/>{estudiante.nombre}</h1>
        </header>

        {/* Tarjetas de Resumen (Métricas) */}
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

        {/* Lista de Clases / Módulos */}
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