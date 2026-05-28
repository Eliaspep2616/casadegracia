import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Users, FileText, RefreshCw, Settings, ArrowRight, LogOut } from 'lucide-react';
import './DashboardProfesor.css';

const DashboardProfesor = () => {
  const [sincronizando, setSincronizando] = useState(false);
  const navigate = useNavigate();
  const profesor = { nombre: "JUAN PÉREZ" };
  
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
    setTimeout(() => setSincronizando(false), 2000); 
  };

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate('/Academia-lideres');
  };

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
              {sincronizando ? 'SINCRONIZANDO...' : 'SINCRONIZAR TODO'}
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