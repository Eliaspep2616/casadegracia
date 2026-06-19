import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import DetalleTarea from './components/DetalleTarea';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RetiroDeProvision from './components/RetiroDeProvision';
import CarritoPage from './pages/CarritoPage';
import FormularioRegistro from './components/FormularioRegistro';
import PanelStaff from './components/PanelStaff';
import RetiroLanding from './pages/RetiroLanding';
import Liderazgo from './pages/Liderazgo';
import './App.css';
import Academialideres from './pages/AcademiaLideres'; 
import Footer from './components/Footer';
import AulaVirtual from './components/AulaVirtual';
import ForoVirtual from './components/ForoVirtual';
// 🔒 NUEVAS IMPORTACIONES DE SEGURIDAD Y DASHBOARDS
import { supabase } from './supabaseClient'; // Verifica que la ruta de tu archivo supabaseClient sea esta
import RutaProtegida from './components/RutaProtegida';
import DashboardEstudiante from './pages/DashboardEstudiante';
import DashboardProfesor from './pages/DashboardProfesor';
import PanelClaseProfesor from './components/PanelClaseProfesor';
import EditorExamen from './components/EditorExamen';
import PanelDirector from './components/PanelDirector';
const FooterCondicional = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  return <Footer />;
};

function AppContent() {
  // --- ESTADOS ORIGINALES DEL CARRITO ---
  const [carrito, setCarrito] = useState([]);
  const [modal, setModal] = useState({ abierto: false, qty: 0, total: 0 });
  const [precioEvento, setPrecioEvento] = useState(25); 
  
  const location = useLocation();

  const totalItemsCount = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const totalMontoCalculado = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  const añadirAlCarrito = (nuevoProducto) => {
    setCarrito((prev) => [...prev, nuevoProducto]);
  };

  const eliminarDelCarrito = (indiceAEliminar) => {
    setCarrito((prevCarrito) => 
      prevCarrito.filter((_, index) => index !== indiceAEliminar)
    );
  };

  // --- 🛡️ ESTADOS DE SEGURIDAD DE SUPABASE ---
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const [rolUsuario, setRolUsuario] = useState(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  // Efecto para escuchar cuando el usuario inicia o cierra sesión
  useEffect(() => {
    const manejarSesion = async (session) => {
      if (session) {
        setEstaAutenticado(true);
        // Preguntamos a la base de datos qué rol tiene
        const { data, error } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('id', session.user.id)
          .single();

        if (data) {
          setRolUsuario(data.rol);
        } else {
          setRolUsuario('estudiante'); // Rol por defecto por si acaso
        }
      } else {
        setEstaAutenticado(false);
        setRolUsuario(null);
      }
      setCargandoAuth(false); // Quitamos la pantalla de carga
    };

    // Revisar la sesión actual al cargar la página
    supabase.auth.getSession().then(({ data: { session } }) => {
      manejarSesion(session);
    });

    // Quedarse escuchando cambios (cuando vuelve de Google)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      manejarSesion(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {!location.pathname.startsWith('/admin') && <Navbar cantidadCarrito={carrito.length} />}

      <div className="main-wrapper">
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/director" element={<PanelDirector />} />
          <Route path="/tarea/:actividadId" element={<DetalleTarea />} />
          <Route path="/editor-examen/:actividadId" element={<EditorExamen />} />
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<PanelStaff />} />
          <Route path="/retiro" element={<RetiroLanding />} />
          <Route path="/inscripcion" element={<RetiroDeProvision onComprar={añadirAlCarrito} />} />
         <Route path="/foro/:actividadId" element={<ForoVirtual />} />
          <Route 
            path="/carrito" 
            element={
              <CarritoPage 
                items={carrito} 
                alEliminar={eliminarDelCarrito} 
                alPagar={() => setModal({ abierto: true, qty: totalItemsCount, total: totalMontoCalculado })} 
              />
            } 
          /><Route path="/admin-clase/:id" element={<PanelClaseProfesor />} />
          <Route path="/liderazgo" element={<Liderazgo />} />
          <Route path="/Academia-lideres" element={<Academialideres />} />
<Route path="/clase/:id" element={<AulaVirtual />} />  {/* <-- Agrega esta línea */}
          {/* 🔒 RUTAS PROTEGIDAS (DASHBOARDS) */}
          <Route 
            path="/portal-estudiante" 
            element={
              <RutaProtegida 
                usuarioAutenticado={estaAutenticado} 
                rolRequerido="estudiante" 
                rolUsuario={rolUsuario}
                cargando={cargandoAuth}
              >
                <DashboardEstudiante />
              </RutaProtegida>
            } 
          />

          <Route 
            path="/admin-academico" 
            element={
              <RutaProtegida 
                usuarioAutenticado={estaAutenticado} 
                rolRequerido="profesor" 
                rolUsuario={rolUsuario}
                cargando={cargandoAuth}
              >
                <DashboardProfesor />
              </RutaProtegida>
            } 
          />
        </Routes>
      </div>

      <FooterCondicional />

      {modal.abierto && (
        <FormularioRegistro 
          cantidadSeleccionada={modal.qty} 
          totalPagar={modal.total} 
          onCerrar={() => setModal({ ...modal, abierto: false })}
          onExito={() => {
            setCarrito([]); 
            setModal({ ...modal, abierto: false });
          }}
        />
      )}
    </>
  );
}

function App() { 
  return (
    <Router>
      <AppContent />
    </Router>
  ); 
}

export default App;