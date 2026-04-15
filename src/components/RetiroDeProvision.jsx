import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RetiroDeProvision = ({ onComprar }) => {
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false); // 👈 Estado para el banner verde
  const PRECIO = 25.00;
  const navigate = useNavigate();

  const manejarCarrito = () => {
    // 1. Enviamos los datos al estado global de App.jsx
    onComprar({
      id: Date.now(),
      nombreEvento: "Retiro de Provisión",
      precio: PRECIO,
      cantidad: cantidad
    });

    // 2. Activamos el banner de éxito
    setAgregado(true);

    // 3. El banner desaparece solo después de 6 segundos
    setTimeout(() => setAgregado(false), 6000); 
  };

  return (
    <div className="retiro-wrapper">
      
      {/* BANNER DE ÉXITO (Restaurado) */}
    {agregado && (
  <div className="banner-exito">
    <div className="banner-content">
      <span className="banner-texto">
        ✓ <b>¡Producto agregado!</b> Retiro de Provisión ha sido añadido.
      </span>
      
      {/* Solo dejamos el botón de acción principal */}
      <button 
        className="btn-ver-carrito" 
        onClick={() => navigate('/carrito')}
      >
        Ver carrito
      </button>
    </div>
  </div>
)}

      {/* TARJETA PRINCIPAL EN DOS COLUMNAS */}
      <div className="retiro-card">
        {/* COLUMNA 1: IMAGEN (Izquierda) */}
        <div className="retiro-visual">
          <img 
            src="/banner-retiro.jpg" 
            alt="Retiro de Provisión" 
            className="img-retiro-principal" 
          />
        </div>

        {/* COLUMNA 2: INFO (Derecha) */}
        <div className="retiro-info">
          <span className="categoria-tag">INSCRIPCIONES</span>
          <h1 className="titulo-principal">Retiro de provisión</h1>
          <p className="descripcion">
            Te invitamos a una experiencia transformadora donde podrás renovar tus fuerzas 
            y tener un encuentro personal con Dios.
          </p>

          <div className="meta-data">
            <p>📅 24 y 25 de Abril</p>
            <p>📍 Guayaquil, Ecuador</p>
          </div>

          <div className="precio-tag">$25.00</div>

          <div className="compra-footer">
            <div className="selector-cantidad">
              <button onClick={() => setCantidad(c => Math.max(1, c - 1))}>-</button>
              <input type="number" value={cantidad} readOnly />
              <button onClick={() => setCantidad(c => c + 1)}>+</button>
            </div>
            
            <button className="btn-add-cart" onClick={manejarCarrito}>
              AÑADIR AL CARRITO
            </button>
          </div>
          
          <div className="total-display">
            Total a pagar: <span>${(cantidad * PRECIO).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetiroDeProvision;