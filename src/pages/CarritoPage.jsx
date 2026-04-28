import { Link } from 'react-router-dom';
import { Trash2, ArrowLeft } from 'lucide-react';
import './CarritoPage.css';

const CarritoPage = ({ items, alEliminar, alPagar }) => {
  const subtotal = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  return (
    <div className="carrito-page-bg">
      <header className="carrito-hero-black">
        <div className="hero-logo-central">
          <h1 className="logo-temp">GROW</h1>
        </div>
      </header>

      <div className="carrito-container-grid">
        <div className="carrito-card main-cart">
          <h2 className="card-title">Carrito de Compras</h2>
          <div className="divider-line"></div>
          
          {items.length === 0 ? (
            <div className="vacio-msg-container">
              <p className="vacio-msg">Tu carrito está vacío.</p>
              <Link to="/retiro" className="btn-regresar">VER EVENTOS</Link>
            </div>
          ) : (
            <div className="lista-productos">
              {items.map((item, index) => (
                <div key={index} className="item-fila-pro">
                  <div className="item-thumb-pro">
                    {/* 🔄 IMAGEN DINÁMICA: Toma la del item, si no existe, usa la de respaldo */}
                    <img src={item.img || "/banner-retiro.jpg"} alt={item.nombreEvento} />
                  </div>
                  <div className="item-detalles-pro">
                    <h3>{item.nombreEvento}</h3>
                    {/* 🔄 FECHA DINÁMICA */}
                    <p>Fecha: {item.fecha || "Por confirmar"}</p>
                    <p>Cantidad: {item.cantidad}</p>
                    <span className="precio-unit-pro">${item.precio.toFixed(2)}</span>
                  </div>
                  <div className="item-acciones-pro">
                    <button className="btn-borrar-pro" onClick={() => alEliminar(index)}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="carrito-footer-acciones">
            <Link to="/retiro" className="btn-seguir-comprando-link">
              <ArrowLeft size={16} /> Seguir comprando
            </Link>
          </div>
        </div>

        <div className="carrito-card summary-card">
          <h2 className="card-title">Resumen</h2>
          <div className="divider-line"></div>
          <div className="resumen-fila"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="resumen-fila total-row-pro"><span>Total</span><strong>${subtotal.toFixed(2)}</strong></div>
          
          <button 
            className="btn-pago-final-pro" 
            onClick={() => alPagar(subtotal)} 
            disabled={items.length === 0}
          >
            Realizar Pago
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarritoPage;