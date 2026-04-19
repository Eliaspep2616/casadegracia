import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // 👈 Importamos Supabase
import './Retiro.css';
const RetiroDeProvision = ({ onComprar }) => {
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  
  // 1. Nuevos estados para manejar el precio dinámico
  const [precioReal, setPrecioReal] = useState(0);
  const [cargandoPrecio, setCargandoPrecio] = useState(true);
  
  const navigate = useNavigate();
  const EVENTO_ID = '42362cfe-8d10-414f-adb1-7310cec5f7f9'; // El mismo ID de tu evento

  // 2. Traemos el precio desde la base de datos al cargar la página
  useEffect(() => {
    const fetchPrecio = async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('precio_unitario')
        .eq('id', EVENTO_ID)
        .single();
      
      if (data && !error) {
        setPrecioReal(data.precio_unitario);
      } else {
        // Precio por defecto por si falla el internet o la BD
        setPrecioReal(25.00); 
      }
      setCargandoPrecio(false);
    };

    fetchPrecio();
  }, []);

  const manejarCarrito = () => {
    onComprar({
      id: Date.now(),
      nombreEvento: "Retiro de Provisión",
      precio: precioReal, // 👈 Usamos el precio que vino de Supabase
      cantidad: cantidad
    });

    setAgregado(true);
    setTimeout(() => setAgregado(false), 6000); 
  };

  return (
    <div className="retiro-wrapper">
      
      {agregado && (
        <div className="banner-exito">
          <div className="banner-content">
            <span className="banner-texto">
              ✓ <b>¡Producto agregado!</b> Retiro de Provisión ha sido añadido.
            </span>
            <button className="btn-ver-carrito" onClick={() => navigate('/carrito')}>
              Ver carrito
            </button>
          </div>
        </div>
      )}

      <div className="retiro-card">
        <div className="retiro-visual">
          <img src="/banner-retiro.jpg" alt="Retiro de Provisión" className="img-retiro-principal" />
        </div>

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

          {/* 3. Mostramos un texto de carga breve o el precio real */}
          <div className="precio-tag">
            {cargandoPrecio ? 'Cargando...' : `$${precioReal.toFixed(2)}`}
          </div>

          <div className="compra-footer">
            <div className="selector-cantidad">
              <button onClick={() => setCantidad(c => Math.max(1, c - 1))}>-</button>
              <input type="number" value={cantidad} readOnly />
              <button onClick={() => setCantidad(c => c + 1)}>+</button>
            </div>
            
            {/* Deshabilitamos el botón mientras carga el precio para evitar errores */}
            <button className="btn-add-cart" onClick={manejarCarrito} disabled={cargandoPrecio}>
              AÑADIR AL CARRITO
            </button>
          </div>
          
          <div className="total-display">
            Total a pagar: <span>${(cantidad * precioReal).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetiroDeProvision;