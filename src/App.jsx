import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RetiroDeProvision from './components/RetiroDeProvision';
import CarritoPage from './pages/CarritoPage';
import FormularioRegistro from './components/FormularioRegistro';
import PanelStaff from './components/PanelStaff';
import RetiroLanding from './pages/RetiroLanding';
import Liderazgo from './pages/Liderazgo';
import './App.css';
import Footer from './components/Footer';

// 1️⃣ SACAMOS EL FOOTER CONDICIONAL AFUERA (ESTE ES EL LUGAR CORRECTO)
const FooterCondicional = () => {
  const location = useLocation();
  
  // Ocultamos el footer si estamos en el panel de administración (/admin)
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  
  return <Footer />;
};

function AppContent() {
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

  return (
    <>
      {/* Navbar oculto en /admin */}
      {!location.pathname.startsWith('/admin') && <Navbar cantidadCarrito={carrito.length} />}

      <div className="main-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<PanelStaff />} />
          <Route path="/retiro" element={<RetiroLanding />} />
          <Route 
            path="/inscripcion" 
            element={<RetiroDeProvision onComprar={añadirAlCarrito} />} 
          />
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
          <Route path="/liderazgo" element={<Liderazgo />} />
        </Routes>
      </div>

      {/* 2️⃣ LLAMAMOS AL FOOTER AQUÍ, DESPUÉS DEL MAIN-WRAPPER */}
      <FooterCondicional />

      {/* Modal de Pago */}
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