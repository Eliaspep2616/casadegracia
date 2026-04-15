import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RetiroDeProvision from './components/RetiroDeProvision';
import CarritoPage from './pages/CarritoPage';
import FormularioRegistro from './components/FormularioRegistro';
import PanelStaff from './components/PanelStaff';
import './App.css';

function AppContent() {
  const [carrito, setCarrito] = useState([]);
  // El estado inicial en 'false' para que empiece cerrado
  const [modal, setModal] = useState({ abierto: false, qty: 0, total: 0 });
  const location = useLocation();

  const esAdmin = location.pathname === '/admin';

  // Cálculos automáticos para el modal
  const totalItemsCount = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const totalMontoCalculado = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  // Esta función es la que "abre" el panel
  const manejarAbrirPago = () => {
    setModal({
      abierto: true,
      qty: totalItemsCount,
      total: totalMontoCalculado
    });
  };

  const añadirAlCarrito = (nuevoProducto) => {
    setCarrito((prev) => [...prev, nuevoProducto]);
  };

  return (
    <>
      {!esAdmin && <Navbar cantidadCarrito={totalItemsCount} />}

      <div className={esAdmin ? "" : "main-wrapper"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<PanelStaff />} />
          <Route 
            path="/retiro" 
            element={<RetiroDeProvision onComprar={añadirAlCarrito} />} 
          />
          <Route 
            path="/carrito" 
            element={
              <CarritoPage 
                items={carrito} 
                alPagar={manejarAbrirPago} // 👈 Gatillo para abrir el panel
              />
            } 
          />
        </Routes>
      </div>

      {/* RENDERIZADO DEL MODAL */}
      {modal.abierto && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button 
              className="btn-close" 
              onClick={() => setModal({ ...modal, abierto: false })}
            >
              ✕
            </button>
            <FormularioRegistro 
              cantidadSeleccionada={modal.qty} 
              totalPagar={modal.total} 
              onExito={() => {
                alert("¡Registro exitoso!");
                setCarrito([]);
                setModal({ ...modal, abierto: false });
              }}
            />
          </div>
        </div>
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