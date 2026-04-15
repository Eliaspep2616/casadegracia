import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RetiroDeProvision = ({ onComprar }) => {
  const [cantidad, setCantidad] = useState(1);
  // ESTADO PARA MOSTRAR EL BANNER (Vuelve a aparecer)
  const [agregado, setAgregado] = useState(false);
  const PRECIO = 25.00;
  const navigate = useNavigate();

  const manejarCarrito = () => {
    // 1. Enviamos los datos reales al estado global de App.jsx
    onComprar({
      id: Date.now(), // ID único temporal
      nombreEvento: "Retiro de Provisión",
      precio: PRECIO,
      cantidad: cantidad
    });

    // 2. NO NAVEGAMOS AUTOMÁTICAMENTE. Mostramos el banner verde.
    setAgregado(true);

    // 3. Opcional: El banner desaparece solo después de 5 segundos
    setTimeout(() => setAgregado(false), 5000); 
  };

  return (
    <div className="retiro-wrapper">
      {/* BANNER DE CONFIRMACIÓN ESTILO CASA DE FE (IGUAL A LA IMAGEN) */}
      {agregado && (
        <div className="banner-exito">
          <div className="banner-content">
            {/* Texto de confirmación */}
            <span className="banner-texto">
              ✓ <b>¡Producto agregado!</b> Retiro de Provisión ha sido añadido.
            </span>
            {/* Único botón que lleva al carrito */}
            <button 
              className="btn-ver-carrito" 
              onClick={() => navigate('/carrito')}
            >
              Ver carrito
            </button>
          </div>
        </div>
      )}

      {/* TARJETA DEL EVENTO */}
      <div className="retiro-card">
        <div className="retiro-grid">
          {/* Lado Imagen */}
          <div className="retiro-visual">
            <div className="img-container">
              {/* Tu diseño de Photoshop aquí */}
            </div>
          </div>

          {/* Lado Información */}
          <div className="retiro-info">
            <h2 className="categoria-tag">Inscripciones</h2>
            <h1 className="titulo-principal">Retiro de provisión</h1>
            
            <p className="descripcion">
              Te invitamos a una experiencia transformadora donde podrás renovar tus fuerzas 
              y tener un encuentro personal con Dios.
            </p>

            <div className="meta-data">
              <p>📅 24 y 25 de Abril</p>
              <p>📍 Guayaquil, Ecuador</p>
            </div>

            <div className="precio-tag">${PRECIO.toFixed(2)}</div>

            <div className="compra-footer">
              {/* Selector de Cantidad */}
              <div className="selector-cantidad">
                <button onClick={() => cantidad > 1 && setCantidad(cantidad - 1)}>-</button>
                <input type="number" value={cantidad} readOnly />
                <button onClick={() => setCantidad(cantidad + 1)}>+</button>
              </div>
              
              {/* Botón Principal (Ahora solo muestra el banner, no navega) */}
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
    </div>
  );
};

export default RetiroDeProvision;