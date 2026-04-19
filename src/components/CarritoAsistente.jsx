import { useState } from 'react';
import './Carritoa.css'; 
const CarritoAsistente = ({ items, alContinuar, alCerrar }) => {
  // Calculamos el subtotal basado en los items del carrito
  const subtotal = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const cargoServicio = 0.00; // Puedes añadir cargos aquí
  const total = subtotal + cargoServicio;

  return (
    <div className="carrito-sidebar">
      <div className="carrito-header">
        <h3>Tu Carrito (📦)</h3>
        <button className="btn-close-minimal" onClick={alCerrar}>✕</button>
      </div>

      <div className="carrito-body">
        {items.length === 0 ? (
          <p className="carrito-vacio">No hay entradas seleccionadas.</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="carrito-item">
              <div className="item-info">
                <span className="item-nombre">{item.nombreEvento}</span>
                <span className="item-qty">Cantidad: {item.cantidad}</span>
              </div>
              <span className="item-precio">${(item.precio * item.cantidad).toFixed(2)}</span>
            </div>
          ))
        )}
      </div>

      <div className="carrito-footer">
        <div className="resumen-linea">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="resumen-linea total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        
        <button 
          className="btn-pagar" 
          disabled={items.length === 0}
          onClick={() => alContinuar(total)}
        >
          CONTINUAR AL REGISTRO
        </button>
      </div>
    </div>
  );
};

export default CarritoAsistente;