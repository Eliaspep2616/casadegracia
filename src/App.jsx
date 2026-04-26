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

  // 🔥 ESTA FUNCIÓN ELIMINA EL ITEM POR SU ÍNDICE
  const eliminarDelCarrito = (indiceAEliminar) => {
    setCarrito((prevCarrito) => 
      prevCarrito.filter((_, index) => index !== indiceAEliminar)
    );
  };

  return (
    <>
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
                alEliminar={eliminarDelCarrito} // 👈 Conectado aquí
                alPagar={() => setModal({ abierto: true, qty: totalItemsCount, total: totalMontoCalculado })} 
              />
            } 
          />
          <Route path="/liderazgo" element={<Liderazgo />} />
        </Routes>
      </div>

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

function App() { return <Router><AppContent /></Router>; }
export default App;