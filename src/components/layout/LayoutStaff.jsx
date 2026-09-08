import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient.js';

const LayoutStaff = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sesion, setSesion] = useState(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);
  
  // Estados para el login
  const [credenciales, setCredenciales] = useState({ usuario: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [cargandoLogin, setCargandoLogin] = useState(false);

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setCargandoAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Función para iniciar sesión
  const manejarLogin = async (e) => {
    e.preventDefault();
    setCargandoLogin(true);
    setErrorMsg('');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credenciales.usuario,
      password: credenciales.password,
    });

    if (error) {
      setErrorMsg('Usuario o contraseña incorrectos.');
    }
    setCargandoLogin(false);
  };

  // Función para cerrar sesión
  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate('/'); 
  };

  const linkStyle = (path) => ({
    display: 'block',
    padding: '12px 15px',
    color: location.pathname === path ? 'white' : '#cbd5e1',
    background: location.pathname === path ? '#2563eb' : 'transparent',
    textDecoration: 'none',
    borderRadius: '8px',
    marginBottom: '8px',
    fontWeight: 'bold',
    transition: 'background 0.3s'
  });

  // Pantalla de carga mientras verifica la sesión
  if (cargandoAuth) {
    return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>Cargando panel...</div>;
  }

  // Si NO hay sesión, mostramos el formulario de Login
  if (!sesion) {
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f1f5f9' }}>
        <form onSubmit={manejarLogin} style={{ background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 10px 25px rgba(0,0,0,0.1)', width:'100%', maxWidth:'350px' }}>
          <h2 style={{ textAlign:'center', color:'#1e293b', marginBottom:'20px' }}>Acceso al Staff 🔐</h2>
          <input 
            type="email" placeholder="Correo del Staff" required 
            style={{ width:'100%', padding:'12px', marginBottom:'15px', borderRadius:'8px', border:'1px solid #cbd5e1', boxSizing:'border-box' }}
            onChange={(e) => setCredenciales({...credenciales, usuario: e.target.value})} 
          />
          <input 
            type="password" placeholder="Contraseña" required 
            style={{ width:'100%', padding:'12px', marginBottom:'15px', borderRadius:'8px', border:'1px solid #cbd5e1', boxSizing:'border-box' }}
            onChange={(e) => setCredenciales({...credenciales, password: e.target.value})} 
          />
          {errorMsg && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom:'15px', textAlign:'center' }}>{errorMsg}</p>}
          <button type="submit" disabled={cargandoLogin} style={{ width:'100%', padding:'14px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer' }}>
            {cargandoLogin ? 'VERIFICANDO...' : 'ENTRAR'}
          </button>
        </form>
      </div>
    );
  }

  // Si SÍ hay sesión, mostramos el CMS con el Menú Lateral
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      
      {/* Menú Lateral (Sidebar) */}
      <aside style={{ width: '260px', background: '#1e293b', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '30px' }}>🎫 Casa de Gracia</h2>
        
        <nav style={{ flexGrow: 1 }}>
          <Link to="/staff" style={linkStyle('/staff')}>
            📷 Escáner QR
          </Link>
          <Link to="/staff/tickets" style={linkStyle('/staff/tickets')}>
            🎟️ Taquilla
          </Link>
          <Link to="/staff/home" style={linkStyle('/staff/home')}>
            🏠 Editar Home
          </Link>
        </nav>

        <button 
          onClick={cerrarSesion}
          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Cerrar Sesión
        </button>
      </aside>

      {/* Contenedor Principal Dinámico */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        <Outlet /> 
      </main>

    </div>
  );
};

export default LayoutStaff;