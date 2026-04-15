import { Link } from 'react-router-dom';

const CarritoPage = ({ items, alPagar }) => {
  const subtotal = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  return (
    <div className="carrito-page-bg">
      <header className="carrito-hero">
        <div className="hero-logo-central">
          {/* Aquí puedes poner tu logo diseñado */}
          <h1 className="logo-temp">TU LOGO</h1>
        </div>
      </header>

      <div className="carrito-container-grid">
        {/* COLUMNA IZQUIERDA: PRODUCTOS */}
        <div className="carrito-card main-cart">
          <h2 className="card-title">Carrito de Compras</h2>
          <div className="divider-line"></div>
          
          {items.length === 0 ? (
            <div className="vacio-msg">Tu carrito está vacío</div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="item-fila">
                <div className="item-thumb">
                  {/* Imagen del evento que pusiste en public */}
                  <img src="/banner-retiro.jpg" alt="Evento" />
                </div>
                <div className="item-detalles">
                  <h3>{item.nombreEvento}</h3>
                  <p className="item-meta">Fecha: 25 y 26 de Abril</p>
                  <p className="item-meta">Campus: Guayaquil | Cantidad: {item.cantidad}</p>
                </div>
                <div className="item-precio-qty">
                  <span className="precio-unitario">${item.precio.toFixed(2)}</span>
                  <button className="btn-eliminar-simple">🗑</button>
                </div>
              </div>
            ))
          )}

          <div className="carrito-acciones">
            <Link to="/" className="btn-seguir">Seguir comprando</Link>
            <button className="btn-actualizar-outline">Actualizar Carrito</button>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN */}
        <div className="carrito-card summary-card">
          <h2 className="card-title">Resumen</h2>
          <div className="divider-line"></div>
          <div className="resumen-fila">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="resumen-fila total-row">
            <span>Total</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>
          <button 
            className="btn-pago-final" 
            onClick={alPagar}
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