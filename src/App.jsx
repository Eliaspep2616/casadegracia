import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RetiroDeProvision from './components/RetiroDeProvision';
import CarritoPage from './pages/CarritoPage';
import FormularioRegistro from './components/FormularioRegistro';
import PanelStaff from './components/PanelStaff';
import './App.css';
import './components/Formulario.css';
import Liderazgo from './pages/Liderazgo';
function AppContent() {
  const [carrito, setCarrito] = useState([]);
  const [modal, setModal] = useState({ abierto: false, qty: 0, total: 0 });
  const location = useLocation();

  const esAdmin = location.pathname.startsWith('/admin');
  const totalItemsCount = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const totalMontoCalculado = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

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
          <Route path="/retiro" element={<RetiroDeProvision onComprar={añadirAlCarrito} />} />
          <Route 
            path="/carrito" 
            element={
              <CarritoPage 
                items={carrito} 
                alPagar={() => setModal({ abierto: true, qty: totalItemsCount, total: totalMontoCalculado })} 
              />
            } 
          />
          <Route path="/liderazgo" element={<Liderazgo />} />
        </Routes>
      </div>

      {/* AQUÍ ESTÁ LA MAGIA CORREGIDA */}
      {modal.abierto && (
        <FormularioRegistro 
          cantidadSeleccionada={modal.qty} 
          totalPagar={modal.total} 
          
          /* 👈 Esta es la función correcta para CERRAR la X */
          onCerrar={() => setModal({ ...modal, abierto: false })}
          
          /* Esto pasa cuando el pago termina exitosamente */
          onExito={() => {
            setCarrito([]); // Vaciamos el carrito
            setModal({ ...modal, abierto: false }); // Cerramos el formulario
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