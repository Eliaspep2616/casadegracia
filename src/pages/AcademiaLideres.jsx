import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Check, BookOpen, Users, GraduationCap } from 'lucide-react'; // Usamos los mismos íconos de tu proyecto
import './AcademiaLideres.css';

const AcademiaLideres = () => {
  const [loading, setLoading] = useState(false);
  const [rol, setRol] = useState('estudiante'); 

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes: 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.students.readonly'
      }
    });
    if (error) console.error("Error al ingresar:", error.message);
    setLoading(false);
  };

  return (
    <div className="academia-page-container">
      <div className="academia-main-wrapper">
        
        {/* Título Gigante estilo "Hero Audaz" */}
        <div className="academia-header-section">
          <p className="academia-subtitle">CASA DE GRACIA</p>
          <h1 className="academia-audaz-title">ACADEMIA<br/>DE LÍDERES</h1>
        </div>

        <div className="academia-content-grid">
          
          {/* Columna Izquierda: Información */}
          <div className="academia-info-box">
            <p className="academia-description">
              Un espacio de formación integral diseñado para equipar, capacitar y desarrollar el potencial de quienes están llamados a servir y guiar con excelencia.
            </p>

            <ul className="academia-perks">
              <li>
                <div className="icon-circle"><BookOpen size={20} strokeWidth={2.5} /></div>
                <div>
                  <strong>Módulos Especializados</strong>
                  <p>Estudio estructurado en el desarrollo del carácter.</p>
                </div>
              </li>
              <li>
                <div className="icon-circle"><GraduationCap size={20} strokeWidth={2.5} /></div>
                <div>
                  <strong>Gestión Académica</strong>
                  <p>Seguimiento de notas integrado con Google Classroom.</p>
                </div>
              </li>
              <li>
                <div className="icon-circle"><Users size={20} strokeWidth={2.5} /></div>
                <div>
                  <strong>Comunidad</strong>
                  <p>Conecta con mentores en un ambiente de apoyo.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Columna Derecha: Tarjeta de Login Moderna */}
          <div className="academia-login-wrapper">
            <div className="academia-glass-card">
              
              {/* Selector de Rol Estilo "Pill" */}
              <div className="modern-tabs">
                <button 
                  className={`m-tab ${rol === 'estudiante' ? 'active' : ''}`}
                  onClick={() => setRol('estudiante')}
                >
                  Estudiante
                </button>
                <button 
                  className={`m-tab ${rol === 'profesor' ? 'active' : ''}`}
                  onClick={() => setRol('profesor')}
                >
                  Profesor
                </button>
              </div>

              <div className="login-texts">
                <h3>{rol === 'estudiante' ? 'Portal Estudiantil' : 'Portal Docente'}</h3>
                <p>
                  {rol === 'estudiante' 
                    ? 'Ingresa para revisar tu progreso, calificaciones y material de estudio.' 
                    : 'Ingresa para gestionar tus clases, calificar y sincronizar con Classroom.'}
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="btn-google-modern"
              >
                {loading ? (
                  <span className="modern-spinner"></span>
                ) : (
                  <>
                    <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="g-icon" />
                    <span>Continuar como {rol === 'estudiante' ? 'Estudiante' : 'Docente'}</span>
                  </>
                )}
              </button>

              <p className="login-disclaimer">
                Al ingresar, autorizas la sincronización de tus datos con Google Classroom.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AcademiaLideres;