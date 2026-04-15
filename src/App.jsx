import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RetiroDeProvision from './components/RetiroDeProvision';
import CarritoPage from './pages/CarritoPage';
import FormularioRegistro from './components/FormularioRegistro';
import './App.css';

function App() {
  const [carrito, setCarrito] = useState([]);
  const [modal, setModal] = useState({ abierto: false, qty: 0, total: 0 });

  // --- 1. CALCULAMOS LAS VARIABLES ANTES DEL RETURN ---
  // Esto evita el error "totalItems is not defined"
  const totalItemsCount = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const totalMontoCalculado = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  // --- 2. FUNCIÓN PARA ABRIR EL PAGO ---
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
    <Router>
      {/* Pasamos el conteo al Navbar para que se vea la burbuja roja */}
      <Navbar cantidadCarrito={totalItemsCount} />

      <div className="main-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route 
            path="/retiro" 
            element={<RetiroDeProvision onComprar={añadirAlCarrito} />} 
          />

          <Route 
            path="/carrito" 
            element={
              <CarritoPage 
                items={carrito} 
                alPagar={manejarAbrirPago} 
              />
            } 
          />
        </Routes>
      </div>

      {/* MODAL DE REGISTRO */}
      {modal.abierto && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="btn-close" onClick={() => setModal({ ...modal, abierto: false })}>✕</button>
            <FormularioRegistro 
              cantidadSeleccionada={modal.qty} 
              totalPagar={modal.total} 
              onExito={() => {
                alert("¡Inscripción completada!");
                setCarrito([]); // Vaciamos el carrito tras el pago
                setModal({ ...modal, abierto: false });
              }}
            />
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;