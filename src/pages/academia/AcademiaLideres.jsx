import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import './AcademiaLideres.css';

const AcademiaLideres = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  
  // Estados para el formulario de login
  const [identificacion, setIdentificacion] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  useEffect(() => {
    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('id', session.user.id)
          .maybeSingle();

        if (perfil?.rol === 'director' || perfil?.rol === 'admin') {
          navigate('/panel-director');
        } else if (perfil?.rol === 'profesor') {
          navigate('/admin-academico');
        } else {
          navigate('/portal-estudiante');
        }
      } else {
        setCargando(false); 
      }
    };

    verificarSesion();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        verificarSesion();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // FUNCIÓN PARA INICIAR SESIÓN CON CÉDULA Y CONTRASEÑA
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);
    setErrorMsg('');

    // Limpiamos la cédula y armamos el correo SIN espacios al final
    const cedulaLimpia = identificacion.trim();
    const correoInterno = `${cedulaLimpia}@academia.local`; 

    const { error } = await supabase.auth.signInWithPassword({
      email: correoInterno,
      password: password
    });

    if (error) {
      setErrorMsg('Credenciales incorrectas. Verifica tu cédula y contraseña.');
      setLoadingLogin(false);
    }
  };

  if (cargando) return <div className="academia-page-container" style={{ alignItems: 'center' }}><div className="modern-spinner"></div></div>;

  return (
    <div className="academia-page-container">
      <div className="academia-main-wrapper">
        
        <div className="academia-header-section text-center" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p className="academia-subtitle">BIENVENIDO A LA</p>
          <h1 className="academia-audaz-title">ACADEMIA DE LÍDERES</h1>
        </div>

        <div className="academia-content-grid">
          {/* COLUMNA IZQUIERDA: INFORMACIÓN */}
          <div>
            <p className="academia-description">
              Prepárate para llevar tu llamado al siguiente nivel. Nuestra academia está diseñada para formar líderes con bases sólidas, carácter y visión para expandir el Reino.
            </p>
            <ul className="academia-perks">
              <li>
                <div className="icon-circle">📚</div>
                <div>
                  <strong>Material Exclusivo</strong>
                  <p>Accede a clases, PDFs y recursos diseñados por nuestros pastores.</p>
                </div>
              </li>
              <li>
                <div className="icon-circle">🎓</div>
                <div>
                  <strong>Acompañamiento</strong>
                  <p>Tus profesores evaluarán tu progreso y te guiarán paso a paso.</p>
                </div>
              </li>
              <li>
                <div className="icon-circle">🌐</div>
                <div>
                  <strong>Campus Virtual 24/7</strong>
                  <p>Estudia desde cualquier lugar y en cualquier momento.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* COLUMNA DERECHA: TARJETA DE LOGIN */}
          <div>
            <div className="academia-glass-card">
              <div className="modern-tabs">
              </div>

              <div className="login-texts">
                <h3>Inicia Sesión</h3>
                <p>Ingresa tu número de cédula y contraseña para acceder a tus clases.</p>
              </div>

              {errorMsg && (
                <div className="login-error">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLoginSubmit}>
                <div className="login-form-group">
                  <label className="login-label">Cédula de Identidad</label>
                  <input 
                    type="text" 
                    required 
                    className="login-input" 
                    placeholder="Ej: 0912345678"
                    value={identificacion}
                    onChange={(e) => setIdentificacion(e.target.value)}
                  />
                </div>

                <div className="login-form-group">
                  <label className="login-label">Contraseña</label>
                  <input 
                    type="password" 
                    required 
                    className="login-input" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-login-submit" disabled={loadingLogin}>
                  {loadingLogin ? 'Iniciando...' : 'Iniciar Sesión'}
                </button>
              </form>

              <p className="login-disclaimer">
                Si es tu primera vez ingresando, tu contraseña es tu mismo número de cédula.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AcademiaLideres;