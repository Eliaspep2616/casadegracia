import { Link } from 'react-router-dom';

// 1. Añadimos 'alPagar' a las props para recibir la orden desde App.jsx
const CarritoPage = ({ items, alPagar }) => {
  // Cálculo de totales
  const subtotal = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const total = subtotal;

  return (
    <div className="carrito-page-bg">
      <header className="carrito-hero">
        <div className="hero-logo-central">
          <img src="/logo-blanco.png" alt="Logo" className="logo-grande" />
        </div>
      </header>

      <div className="carrito-container-grid">
        <div className="carrito-card main-cart">
          <h2 className="card-title">Carrito de Compras</h2>
          <div className="divider-line"></div>
          
          {items.length === 0 ? (
            <div className="vacio-msg">Tu carrito está vacío</div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="item-fila">
                <div className="item-thumb">
                  <img src="/thumb-evento.jpg" alt="Evento" />
                </div>
                <div className="item-detalles">
                  <h3>{item.nombreEvento}</h3>
                  <p>Fecha: 25 y 26 de Abril</p>
                  <p>Campus: Guayaquil | Cantidad: {item.cantidad}</p>
                </div>
                <div className="item-precio-qty">
                  <input type="number" value={item.cantidad} readOnly className="qty-input-mini" />
                  <span className="precio-unitario">${item.precio.toFixed(2)}</span>
                  <button className="btn-eliminar">🗑</button>
                </div>
              </div>
            ))
          )}

          <div className="carrito-acciones">
            <Link to="/" className="btn-seguir">Seguir comprando</Link>
            <button className="btn-actualizar">Actualizar Carrito</button>
          </div>
        </div>

        <div className="carrito-card summary-card">
          <h2 className="card-title">Resumen</h2>
          <div className="divider-line"></div>
          <div className="resumen-fila">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="resumen-fila total-row">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>

          {/* 2. Conectamos la función onClick y bloqueamos si el carrito está vacío */}
          <button 
            className="btn-pago-final" 
            onClick={alPagar}
            disabled={items.length === 0}
          >
            {items.length === 0 ? "Selecciona entradas primero" : "Realizar Pago"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarritoPage;