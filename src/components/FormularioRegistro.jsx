import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ReCAPTCHA from "react-google-recaptcha";

const FormularioRegistro = ({ onExito }) => {
  const [paso, setPaso] = useState(1); // Paso 1: Formulario, Paso 2: Transferencia
  const [captchaValido, setCaptchaValido] = useState(false);
  const [stock, setStock] = useState(800);
  const PRECIO_UNITARIO = 25.00; // Define aquí el precio

  const [asistente, setAsistente] = useState({
    nombre: '', 
    cedula: '', 
    telefono: '', 
    correo: '', 
    cantidad: 1 
  });

  const handleChange = (e) => {
    setAsistente({ ...asistente, [e.target.name]: e.target.value });
  };

  const consultarStock = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('stock_disponible')
        .eq('id', '42362cfe-8d10-414f-adb1-7310cec5f7f9')
        .maybeSingle();

      if (error) throw error;
      if (data && typeof data.stock_disponible !== 'undefined') {
        setStock(data.stock_disponible);
      }
    } catch (err) {
      console.error("Error cargando stock:", err.message);
    }
  };

  useEffect(() => {
    consultarStock();
  }, []);

  const enviarRegistro = async (e) => {
    e.preventDefault();
    
    const parametros = {
      _evento_id: '42362cfe-8d10-414f-adb1-7310cec5f7f9',
      _nombre: asistente.nombre,
      _cedula: asistente.cedula,
      _correo: asistente.correo,
      _telefono: asistente.telefono
      // Nota: Si tu RPC acepta cantidad, agrégalo aquí como _cantidad: asistente.cantidad
    };

    try {
      const { data, error } = await supabase.rpc('comprar_ticket_seguro', parametros);

      if (error) {
        alert("No se pudo guardar: " + error.message);
        return;
      }

      if (data.status === 'error') {
        alert(data.mensaje);
        return;
      }

      // Si todo sale bien, pasamos a la pantalla de transferencia
      setPaso(2);
    } catch (err) {
      console.error("Error crítico:", err);
    }
  };

  // Función para abrir WhatsApp con el mensaje prellenado
  const enviarComprobanteWA = () => {
    const numeroWA = "593987654321"; // 👈 PON TU NÚMERO AQUÍ
    const mensaje = `Hola, acabo de registrarme para el Retiro. %0ANombre: ${asistente.nombre} %0ACédula: ${asistente.cedula} %0ACantidad: ${asistente.cantidad} entradas. %0AAdjunto el comprobante de transferencia por $${(asistente.cantidad * PRECIO_UNITARIO).toFixed(2)}.`;
    window.open(`https://wa.me/${numeroWA}?text=${mensaje}`, '_blank');
  };

  return (
    <div className="registro-card-v2">
      {paso === 1 ? (
        <>
          <div className="registro-header">
            <h2 className="registro-titulo">Registro Oficial 🏎️</h2>
            <span className={`badge-stock ${stock <= 0 ? 'agotado' : ''}`}>
              {stock} disponibles
            </span>
          </div>

          <form className="registro-form" onSubmit={enviarRegistro}>
            <label className="seccion-label">Información Personal</label>
            
            <div className="form-group full-width">
              <input type="text" name="nombre" placeholder="Nombre Completo" onChange={handleChange} required />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <input type="text" name="cedula" placeholder="Cédula/ID" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <input type="tel" name="telefono" placeholder="WhatsApp" onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group full-width">
              <input type="email" name="correo" placeholder="Correo Electrónico" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label style={{fontSize: '0.8rem', color: '#666'}}>Número de entradas</label>
              <input 
                type="number" 
                name="cantidad" 
                min="1" 
                max={stock}
                value={asistente.cantidad} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="captcha-container">
              <ReCAPTCHA
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" 
                onChange={() => setCaptchaValido(true)}
                onExpired={() => setCaptchaValido(false)}
                theme="light"
              />
            </div>

            <button 
              type="submit" 
              disabled={!captchaValido || stock <= 0}
              className={`btn-finalizar-registro ${(!captchaValido || stock <= 0) ? 'disabled' : ''}`}
            >
              {stock > 0 
                ? (captchaValido ? `Continuar al Pago - $${(asistente.cantidad * PRECIO_UNITARIO).toFixed(2)}` : "Completa el Captcha") 
                : "EVENTO AGOTADO"}
            </button>
          </form>
        </>
      ) : (
        /* --- PASO 2: VISTA DE TRANSFERENCIA --- */
        <div className="pago-container">
          <div className="exito-icon">✓</div>
          <h2 className="registro-titulo">¡Casi listo, ${asistente.nombre.split(' ')[0]}!</h2>
          <p className="pago-instrucciones">Para completar tu inscripción, realiza la transferencia bancaria:</p>
          
          <div className="datos-banco">
            <p><strong>Banco:</strong> Banco Pichincha</p>
            <p><strong>Tipo de Cuenta:</strong> Ahorros</p>
            <p><strong>Número:</strong> 220xxxxxxx</p>
            <p><strong>Nombre:</strong> Nombre de la Iglesia / Persona</p>
            <p><strong>Cédula:</strong> 09xxxxxxx</p>
            <div className="total-pago-box">
              <span>Valor a transferir:</span>
              <strong>${(asistente.cantidad * PRECIO_UNITARIO).toFixed(2)}</strong>
            </div>
          </div>

          <div className="alerta-pago">
            ⚠️ Tienes 2 horas para enviar el comprobante o tu reserva se cancelará.
          </div>

          <button className="btn-whatsapp" onClick={enviarComprobanteWA}>
            ENVIAR COMPROBANTE POR WHATSAPP
          </button>
          
          <button className="btn-cerrar-final" onClick={() => onExito()}>
            Finalizar y volver al inicio
          </button>
        </div>
      )}
    </div>
  );
};

export default FormularioRegistro;