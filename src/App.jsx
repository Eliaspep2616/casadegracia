import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './config/supabaseClient.js';
import './App.css';

// 1. Componentes Base (Layout)
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import RutaProtegida from './components/layout/RutaProtegida.jsx';

// 2. Páginas Públicas y Web
import Home from './pages/web/Home.jsx';
import RetiroLanding from './pages/web/RetiroLanding.jsx';
import RetiroDeProvision from './pages/web/RetiroDeProvision.jsx';
import Liderazgo from './pages/web/Liderazgo.jsx';
import Voluntario from './pages/web/Voluntario.jsx';

// 3. Páginas Raíz
import CarritoPage from './pages/CarritoPage.jsx';
import NotFound from './pages/NotFound.jsx';

// 4. Páginas de Academia y Admin
import AcademiaLideres from './pages/academia/AcademiaLideres.jsx';
import DashboardEstudiante from './pages/academia/DashboardEstudiante.jsx';
import DashboardProfesor from './pages/academia/DashboardProfesor.jsx';
import PanelDirector from './pages/admin/PanelDirector.jsx';
import PanelClaseProfesor from './pages/admin/PanelClaseProfesor.jsx';
import PanelStaff from './pages/admin/PanelStaff.jsx';

// 5. Componentes de Academia
import AulaVirtual from './components/academia/AulaVirtual.jsx';
import DetalleTarea from './components/academia/DetalleTarea.jsx';
import EditorExamen from './components/academia/EditorExamen.jsx';
import ForoVirtual from './components/academia/ForoVirtual.jsx';

// 6. Componentes de Ticketera
import FormularioRegistro from './components/ticketera/FormularioRegistro.jsx';

const FooterCondicional = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/panel-director')) {
    return null;
  }
  return <Footer />;
};

function AppContent() {
  const [carrito, setCarrito] = useState([]);
  const [modal, setModal] = useState({ abierto: false, qty: 0, total: 0 });
  
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

  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const [rolUsuario, setRolUsuario] = useState(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  useEffect(() => {
    const manejarSesion = async (session) => {
      if (session) {
        setEstaAutenticado(true);
        const { data } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('id', session.user.id)
          .single();

        if (data) {
          setRolUsuario(data.rol);
        } else {
          setRolUsuario('estudiante'); 
        }
      } else {
        setEstaAutenticado(false);
        setRolUsuario(null);
      }
      setCargandoAuth(false); 
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      manejarSesion(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      manejarSesion(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const mostrarNavbar = !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/panel-director');

  return (
    <>
      {mostrarNavbar && <Navbar cantidadCarrito={carrito.length} />}

      <div className="main-wrapper">
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Home />} />
          <Route path="/Voluntario" element={<Voluntario />} />
          <Route path="/liderazgo" element={<Liderazgo />} />
          <Route path="/retiro" element={<RetiroLanding />} />
          <Route path="/inscripcion" element={<RetiroDeProvision onComprar={añadirAlCarrito} />} />
          <Route path="/Academia-lideres" element={<AcademiaLideres />} />
          
          <Route 
            path="/carrito" 
            element={
              <CarritoPage 
                items={carrito} 
                alEliminar={eliminarDelCarrito} 
                alPagar={() => setModal({ abierto: true, qty: totalItemsCount, total: totalMontoCalculado })} 
              />
            } 
          />

          {/* RUTAS DE ACADEMIA */}
          <Route path="/tarea/:actividadId" element={<DetalleTarea />} />
          <Route path="/editor-examen/:actividadId" element={<EditorExamen />} />
          <Route path="/foro/:actividadId" element={<ForoVirtual />} />
          <Route path="/clase/:id" element={<AulaVirtual />} />  
          <Route path="/admin-clase/:id" element={<PanelClaseProfesor rolUsuarioGlobal={rolUsuario} />} />

          {/* 🔒 RUTAS PROTEGIDAS (DASHBOARDS ACADÉMICOS) */}
          <Route 
            path="/panel-director" 
            element={
              <RutaProtegida usuarioAutenticado={estaAutenticado} rolRequerido="director" rolUsuario={rolUsuario} cargando={cargandoAuth}>
                <PanelDirector />
              </RutaProtegida>
            } 
          />

          <Route 
            path="/portal-estudiante" 
            element={
              <RutaProtegida usuarioAutenticado={estaAutenticado} rolRequerido="estudiante" rolUsuario={rolUsuario} cargando={cargandoAuth}>
                <DashboardEstudiante />
              </RutaProtegida>
            } 
          />

          <Route 
            path="/admin-academico" 
            element={
              <RutaProtegida usuarioAutenticado={estaAutenticado} rolRequerido="profesor" rolUsuario={rolUsuario} cargando={cargandoAuth}>
                <DashboardProfesor />
              </RutaProtegida>
            } 
          />

          {/* 🛠️ RUTAS DEL STAFF */}
          <Route path="/staff" element={<PanelStaff />} />
          <Route path="/staff/tickets" element={<PanelStaff />} />

          {/* RUTA 404 */}
          <Route path="*" element={<NotFound />} />
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