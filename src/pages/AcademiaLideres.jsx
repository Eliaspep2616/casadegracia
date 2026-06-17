import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { BookOpen, Users, GraduationCap, Lock, CreditCard } from 'lucide-react'; 
import './AcademiaLideres.css';

const AcademiaLideres = () => {
  const [loading, setLoading] = useState(false);
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // Vigila si ya hay una sesión activa para no pedir login de nuevo
  useEffect(() => {
    const revisarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) enrutarPorRol(session.user.id);
    };
    revisarSesion();
  }, [navigate]);

  const enrutarPorRol = async (userId) => {
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', userId)
      .single();

    if (perfil?.rol === 'profesor' || perfil?.rol === 'admin') {
      navigate('/admin-academico');
    } else {
      navigate('/portal-estudiante');
    }
  };

  const handleIngreso = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Transformamos la cédula en el correo ficticio que creamos en Supabase
    const emailFicticio = `${cedula.trim()}@academia.local`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailFicticio,
      password: password,
    });

    if (error) {
      setErrorMsg('Cédula o contraseña incorrecta. Intenta de nuevo.');
      setLoading(false);
    } else {
      await enrutarPorRol(data.user.id);
    }
  };

  return (
    <div className="academia-page-container">
      <div className="academia-main-wrapper">
        
        <div className="academia-header-section">
          <p className="academia-subtitle">CASA DE GRACIA</p>
          <h1 className="academia-audaz-title">ACADEMIA<br/>DE LÍDERES</h1>
        </div>

        <div className="academia-content-grid">
          
          {/* Columna Izquierda */}
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
                  <strong>Campus Virtual</strong>
                  <p>Gestión de tareas, clases y recursos en un solo lugar.</p>
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

          {/* Columna Derecha: Nuevo Formulario de Credenciales */}
          <div className="academia-login-wrapper">
            <div className="academia-glass-card">

              <div className="login-texts">
                <h3>Acceso al Campus</h3>
                <p>Ingresa tus credenciales institucionales.</p>
              </div>

              {errorMsg && (
                <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem', fontWeight: '600', textAlign: 'center' }}>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleIngreso} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: '12px', padding: '0 15px', border: '1px solid #eaeaea' }}>
                  <CreditCard size={20} color="#777" />
                  <input 
                    type="text" 
                    placeholder="Número de Cédula" 
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    required
                    style={{ border: 'none', background: 'transparent', padding: '16px', width: '100%', outline: 'none', fontFamily: 'Montserrat', fontSize: '1rem', fontWeight: '500' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: '12px', padding: '0 15px', border: '1px solid #eaeaea' }}>
                  <Lock size={20} color="#777" />
                  <input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ border: 'none', background: 'transparent', padding: '16px', width: '100%', outline: 'none', fontFamily: 'Montserrat', fontSize: '1rem', fontWeight: '500' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-google-modern"
                  style={{ backgroundColor: '#1a1a1a', color: 'white', marginTop: '10px', border: 'none' }}
                >
                  {loading ? (
                    <span className="modern-spinner" style={{ borderColor: '#333', borderTopColor: '#fff' }}></span>
                  ) : (
                    'Ingresar al Portal'
                  )}
                </button>
              </form>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AcademiaLideres;