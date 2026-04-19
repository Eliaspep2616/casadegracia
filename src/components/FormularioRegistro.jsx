import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ReCAPTCHA from "react-google-recaptcha";
import './Formulario.css'; 

const FormularioRegistro = ({ onExito, onCerrar, cantidadSeleccionada, totalPagar, precioManual }) => {
  const [paso, setPaso] = useState(1);
  const [captchaValido, setCaptchaValido] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [configEvento, setConfigEvento] = useState({ 
    cuenta: 'Cargando...', 
    telefono: '',
    titular: '',
    cedula: '',
    correo: ''
  });
  
  const EVENTO_ID = '42362cfe-8d10-414f-adb1-7310cec5f7f9';

  const [asistente, setAsistente] = useState({
    nombre: '', 
    cedula: '', 
    telefono: '', 
    correo: '', 
    cantidad: cantidadSeleccionada || 1 
  });

  const montoTotalSeguro = totalPagar !== undefined 
    ? totalPagar 
    : (asistente.cantidad * (precioManual || 25));

  useEffect(() => {
    const fetchConfig = async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('cuenta_bancaria, mensaje_whatsapp, titular_cuenta, cedula_cuenta, correo_contacto')
        .eq('id', EVENTO_ID)
        .single();
      
      if (error || !data) {
        setConfigEvento({
          cuenta: 'Banco Pichincha - Ahorros #22000000',
          telefono: '593999999999',
          titular: 'Iglesia Gracia Kids',
          cedula: '0987654321',
          correo: 'pagos@iglesia.com'
        });
        return;
      }
      
      setConfigEvento({
        cuenta: data.cuenta_bancaria,
        telefono: data.mensaje_whatsapp,
        titular: data.titular_cuenta,
        cedula: data.cedula_cuenta,
        correo: data.correo_contacto
      });
    };
    fetchConfig();
  }, []);

  const validarCedula = (ced) => {
    if (ced.length !== 10) return false;
    const digito_region = parseInt(ced.substring(0, 2));
    if (digito_region < 1 || digito_region > 24) return false;
    const ultimo_digito = parseInt(ced.substring(9, 10));
    let suma = 0;
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    for (let i = 0; i < 9; i++) {
      let valor = parseInt(ced[i]) * coeficientes[i];
      suma += valor > 9 ? valor - 9 : valor;
    }
    const total = (suma % 10 === 0) ? 0 : 10 - (suma % 10);
    return total === ultimo_digito;
  };

  const handleChange = (e) => {
    setAsistente({ ...asistente, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    if (!validarCedula(asistente.cedula)) {
      setErrorMsg('La cédula ingresada no es válida.');
      return;
    }
    if (!captchaValido) {
      setErrorMsg('Por favor, completa el captcha.');
      return;
    }
    setCargando(true);
    try {
      const { data, error } = await supabase.rpc('comprar_ticket_seguro', {
        _evento_id: EVENTO_ID,
        _nombre: asistente.nombre,
        _cedula: asistente.cedula,
        _telefono: asistente.telefono,
        _correo: asistente.correo,
        _cantidad: parseInt(asistente.cantidad)
      });
      if (error) throw error;
      if (data.status === 'error') {
        setErrorMsg(data.message);
      } else {
        setPaso(2);
      }
    } catch (err) {
      setErrorMsg('Error de conexión.');
    } finally {
      setCargando(false);
    }
  };

  const enviarWA = () => {
    const texto = `¡Hola! Acabo de registrarme para el Retiro.\n👤: ${asistente.nombre}\n🆔: ${asistente.cedula}\n🎟️ Cantidad: ${asistente.cantidad}\n💰 Transferido: $${montoTotalSeguro.toFixed(2)}\n\nAdjunto el comprobante.`;
    window.open(`https://wa.me/${configEvento.telefono}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  return (
    <div className="registro-container">
      {paso === 1 ? (
        <form onSubmit={manejarRegistro} className="registro-form">
        {/* 👈 BOTÓN X FORZADO A APARECER */}
          <button type="button" className="btn-cerrar-flotante" onClick={onCerrar}>✕</button>

          <h2>Datos del Asistente</h2>
          <p>Se reservarán <strong>{asistente.cantidad} cupos</strong>.</p>
          <input name="nombre" placeholder="Nombre y Apellido" onChange={handleChange} required />
          <input name="cedula" placeholder="Cédula (10 dígitos)" onChange={handleChange} required maxLength="10" />
          <input name="telefono" placeholder="WhatsApp (ej: 099...)" onChange={handleChange} required />
          <input name="correo" type="email" placeholder="Correo electrónico" onChange={handleChange} required />
          {errorMsg && <div className="error-badge">{errorMsg}</div>}
          <div className="captcha-wrapper" style={{ margin: '15px 0', display: 'flex', justifyContent: 'center' }}>
            <ReCAPTCHA sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" onChange={() => setCaptchaValido(true)} />
          </div>
          <button type="submit" disabled={cargando} className="btn-final">
            {cargando ? 'PROCESANDO...' : 'RESERVAR MI LUGAR'}
          </button>
        </form>
      ) : (
        <div className="paso-pago" style={{textAlign: 'center'}}>
     <button type="button" className="btn-cerrar-flotante" onClick={onCerrar}>✕</button>

          <h3 style={{color: '#16a34a', fontSize: '1.5rem', marginBottom: '10px'}}>✅ ¡Reserva Exitosa!</h3>
          <p style={{color: '#334155', marginBottom: '15px'}}>Por favor, realiza la transferencia con estos datos:</p>
          
          <div className="pago-box" style={{ textAlign: 'left' }}>
            <p><strong>Titular:</strong> {configEvento.titular}</p>
            <p><strong>Cédula/RUC:</strong> {configEvento.cedula}</p>
            <p><strong>Banco:</strong> {configEvento.cuenta}</p>
            <p><strong>Monto:</strong> <span style={{color: '#004a99', fontWeight: 'bold'}}>${montoTotalSeguro.toFixed(2)}</span></p>
            <hr style={{ margin: '10px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Envía el comprobante a: <strong>{configEvento.correo}</strong>
            </p>
          </div>

          <button onClick={enviarWA} className="btn-final" style={{background: '#25D366', marginBottom: '10px'}}>
            📲 ENVIAR COMPROBANTE POR WHATSAPP
          </button>
          
          <button onClick={onExito} className="btn-final" style={{background: 'transparent', color: '#64748b', border: '2px solid #cbd5e1', boxShadow: 'none'}}>
            VOLVER AL INICIO
          </button>
        </div>
      )}
    </div>
  );
};

export default FormularioRegistro;