import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient.js';
import './Retiro.css';

const RetiroDeProvision = ({ onComprar }) => {
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  
  const [precioReal, setPrecioReal] = useState(0);
  // 🛡️ CORRECCIÓN: Usamos stockDisponible para coincidir con la base de datos
  const [stockDisponible, setStockDisponible] = useState(null); 
  const [cargandoDatos, setCargandoDatos] = useState(true);
  
  const navigate = useNavigate();
  const EVENTO_ID = '42362cfe-8d10-414f-adb1-7310cec5f7f9'; 

  useEffect(() => {
    const fetchEventoData = async () => {
      const { data, error } = await supabase
        .from('eventos')
        // 🚨 CORRECCIÓN: El nombre exacto en tu BD es stock_disponible
        .select('precio_unitario, stock_disponible') 
        .eq('id', EVENTO_ID)
        .single();
      
      if (data && !error) {
        setPrecioReal(data.precio_unitario);
        setStockDisponible(data.stock_disponible); 
      } else {
        setPrecioReal(25.00); 
        setStockDisponible(0); 
      }
      setCargandoDatos(false);
    };

    fetchEventoData();
  }, []);

  const manejarCarrito = () => {
    onComprar({
      id: Date.now(),
      nombreEvento: "Retiro de Provisión",
      precio: precioReal, 
      cantidad: cantidad
    });

    setAgregado(true);
    setTimeout(() => setAgregado(false), 6000); 
  };

  // 🛡️ VARIABLE PARA SABER SI ESTÁ AGOTADO
  const estaAgotado = stockDisponible !== null && stockDisponible <= 0;

  return (
    <div className="retiro-wrapper">
      
      {agregado && (
        <div className="banner-exito">
          <div className="banner-content">
            <span className="banner-texto">
              ✓ <b>¡Producto agregado!</b> Retiro de Provisión ha sido añadido a tu carrito.
            </span>
            <button className="btn-ver-carrito" onClick={() => navigate('/carrito')}>
              Ver carrito
            </button>
          </div>
        </div>
      )}

      <div className="retiro-card">
        <div className="retiro-visual">
          <img 
            src="https://lzvolnnndwpyxyoyldea.supabase.co/storage/v1/object/public/assets/retiro_provision_entrada.webp" 
            alt="Retiro de Provisión" 
            className="img-retiro-principal" 
          />
          {estaAgotado && (
             <div className="etiqueta-agotado-img">SOLD OUT</div>
          )}
        </div>

        <div className="retiro-info">
          <span className="categoria-tag">INSCRIPCIONES</span>
          <h1 className="titulo-principal">Retiro de provisión</h1>
          <p className="descripcion">
            Te invitamos a una experiencia transformadora donde podrás renovar tus fuerzas 
            y tener un encuentro personal con Dios.
          </p>

          <div className="meta-data">
            <p>📅 29 y 30 de Mayo</p>
            <p>📍 Guayaquil, Ecuador</p>
            {!estaAgotado && stockDisponible !== null && stockDisponible <= 10 && (
              <p style={{color: '#e11d48', fontWeight: 'bold'}}>⚠️ ¡Últimos {stockDisponible} cupos!</p>
            )}
          </div>

          <div className="precio-tag">
            {cargandoDatos ? 'Cargando...' : `$${precioReal.toFixed(2)}`}
          </div>

          <div className="compra-footer">
            <div className="selector-cantidad">
              <button 
                onClick={() => setCantidad(c => Math.max(1, c - 1))} 
                disabled={estaAgotado || cargandoDatos}
              >
                -
              </button>
              <input type="number" value={estaAgotado ? 0 : cantidad} readOnly />
              <button 
                onClick={() => setCantidad(c => (c < stockDisponible ? c + 1 : c))} 
                disabled={estaAgotado || cargandoDatos || cantidad >= stockDisponible}
              >
                +
              </button>
            </div>
            
            <button 
              className={`btn-add-cart ${estaAgotado ? 'btn-sold-out' : ''}`} 
              onClick={manejarCarrito} 
              disabled={cargandoDatos || estaAgotado}
            >
              {estaAgotado ? 'AGOTADO' : 'AÑADIR AL CARRITO'}
            </button>
          </div>
          
          <div className="total-display">
            Total a pagar: <span>${(estaAgotado ? 0 : cantidad * precioReal).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetiroDeProvision;