import React, { useState } from 'react';
import { Users, FileText, RefreshCw, Settings, ArrowRight } from 'lucide-react';
import './DashboardProfesor.css';

const DashboardProfesor = () => {
  const [sincronizando, setSincronizando] = useState(false);
  const profesor = { nombre: "JUAN PÉREZ" };
  
  // Datos simulados
  const metricas = { alumnos: 45, tareasPorCalificar: 12 };
  
  const clases = [
    { 
      id: 1, 
      titulo: "Liderazgo I: Fundamentos", 
      alumnosInscritos: 20,
      entregasPendientes: 5,
      ultimaSync: "Hace 2 horas"
    },
    { 
      id: 2, 
      titulo: "Cultura del Reino", 
      alumnosInscritos: 25,
      entregasPendientes: 7,
      ultimaSync: "Ayer"
    }
  ];

  const handleSincronizarGlobal = () => {
    setSincronizando(true);
    // Aquí irá la lógica futura para llamar a la API de Google Classroom
    setTimeout(() => setSincronizando(false), 2000); 
  };

  return (
    <div className="prof-page-container">
      <div className="prof-main-wrapper">
        
        {/* Cabecera del Profesor y Botón Global */}
        <header className="prof-header">
          <div>
            <p className="prof-subtitle">PANEL DOCENTE</p>
            <h1 className="prof-title">HOLA,<br/>{profesor.nombre}</h1>
          </div>
          
          <button 
            className="btn-sync-global" 
            onClick={handleSincronizarGlobal}
            disabled={sincronizando}
          >
            <RefreshCw size={18} className={sincronizando ? "animate-spin" : ""} />
            {sincronizando ? 'SINCRONIZANDO...' : 'SINCRONIZAR TODO'}
          </button>
        </header>

        {/* Tarjetas de Resumen (Métricas de Gestión) */}
        <section className="prof-metrics-grid">
          <div className="prof-metric-card dark-card">
            <div className="metric-icon-prof"><Users size={24} strokeWidth={2.5} /></div>
            <div>
              <p className="metric-label-prof">TOTAL ALUMNOS</p>
              <h2 className="metric-value-prof">{metricas.alumnos}</h2>
            </div>
          </div>
          
          <div className="prof-metric-card alert-card">
            <div className="metric-icon-prof"><FileText size={24} strokeWidth={2.5} /></div>
            <div>
              <p className="metric-label-prof">POR CALIFICAR</p>
              <h2 className="metric-value-prof">{metricas.tareasPorCalificar}</h2>
            </div>
          </div>
        </section>

        {/* Lista de Clases Asignadas */}
        <section className="prof-classes-section">
          <div className="section-header-flex">
            <h3 className="section-heading">TUS CLASES</h3>
            <button className="btn-settings"><Settings size={20} /></button>
          </div>
          
          <div className="classes-grid">
            {clases.map((clase) => (
              <div key={clase.id} className="prof-class-card">
                <div className="class-card-header">
                  <h4 className="class-title">{clase.titulo}</h4>
                  <span className="sync-status">Sync: {clase.ultimaSync}</span>
                </div>
                
                <div className="class-stats">
                  <div className="stat-item">
                    <strong>{clase.alumnosInscritos}</strong>
                    <span>Estudiantes</span>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item highlight">
                    <strong>{clase.entregasPendientes}</strong>
                    <span>Entregas nuevas</span>
                  </div>
                </div>
                
                <div className="class-card-footer">
                  <button className="btn-outline-dark">
                    VER NOTAS <ArrowRight size={16} />
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

export default DashboardProfesor;