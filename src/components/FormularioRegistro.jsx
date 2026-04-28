import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Turnstile } from '@marsidev/react-turnstile';
import './Formulario.css'; 

const FormularioRegistro = ({ onExito, onCerrar, cantidadSeleccionada, totalPagar, precioManual }) => {
  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // 🛡️ Capa 1: Estado para la trampa del bot (Honeypot)
  const [honeypot, setHoneypot] = useState('');
  
  // 🛡️ Capa 2: Estado para el token de Cloudflare
  const [turnstileToken, setTurnstileToken] = useState(null);

  const [configEvento, setConfigEvento] = useState({ 
    cuenta: 'Cargando...', 
    telefono: '',
    titular: '',
    cedula: '',
    correo: ''
  });
  
  const EVENTO_ID = '42362cfe-8d10-414f-adb1-7310cec5f7f9';
  
  // ⚠️ PON AQUÍ TU SITE KEY DE CLOUDFLARE
  const TURNSTILE_SITE_KEY = '0x4AAAAAADFIAFXFsTFEh24N';

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
          telefono: '0969018532',
          titular: 'Iglesia',
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

    // 🛡️ VERIFICACIÓN 1: El Honeypot
    if (honeypot !== '') {
      console.warn("Bot detectado por Honeypot.");
      setPaso(2); 
      return;
    }

    // 🛡️ VERIFICACIÓN 2: Cédula ecuatoriana
    if (!validarCedula(asistente.cedula)) {
      setErrorMsg('La cédula ingresada no es válida.');
      return;
    }

    // 🛡️ VERIFICACIÓN 3: Cloudflare Turnstile
    if (!turnstileToken) {
      setErrorMsg('Por favor, espera la verificación de seguridad.');
      return;
    }

    setCargando(true);
    try {
      // LLAMAMOS A LA EDGE FUNCTION (Asegúrate de haberla subido con npx supabase functions deploy)
      const { data, error } = await supabase.functions.invoke('procesar-compra', {
        body: {
          evento_id: EVENTO_ID,
          nombre: asistente.nombre,
          cedula: asistente.cedula,
          telefono: asistente.telefono,
          correo: asistente.correo,
          cantidad: parseInt(asistente.cantidad),
          turnstileToken: turnstileToken
        }
      });

      if (error) throw error;

      if (data.status === 'error') {
        setErrorMsg(data.message);
      } else {
        setPaso(2);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  const enviarWA = () => {
    const texto = `¡Hola! Acabo de registrarme para el Retiro.\nNombre: ${asistente.nombre}\nID: ${asistente.cedula}\nCantidad: ${asistente.cantidad}\nTransferido: $${montoTotalSeguro.toFixed(2)}\n\nAdjunto el comprobante.`;
    window.open(`https://wa.me/${configEvento.telefono}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  return (
    <div className="registro-container">
      {paso === 1 ? (
        <form onSubmit={manejarRegistro} className="registro-form">
          <button type="button" className="btn-cerrar-flotante" onClick={onCerrar}>✕</button>

          <h2>Datos del Asistente</h2>
          <p>Se reservarán <strong>{asistente.cantidad} cupos</strong>.</p>
          
          <input name="nombre" placeholder="Nombre y Apellido" onChange={handleChange} required autoComplete="name" />
          <input name="cedula" placeholder="Cédula (10 dígitos)" onChange={handleChange} required maxLength="10" />
          <input name="telefono" placeholder="WhatsApp (ej: 099...)" onChange={handleChange} required autoComplete="tel" />
          <input name="correo" type="email" placeholder="Correo electrónico" onChange={handleChange} required autoComplete="email" />
          
          {/* 🛡️ Campo Honeypot invisible */}
          <input 
            type="text" 
            name="website_url" 
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ display: 'none' }} 
            tabIndex="-1" 
            autoComplete="off"
          />

          {errorMsg && <div className="error-badge">{errorMsg}</div>}
          
          {/* 🛡️ Widget de Cloudflare Turnstile */}
          <div className="captcha-wrapper" style={{ margin: '15px 0', display: 'flex', justifyContent: 'center', minHeight: '65px' }}>
            <Turnstile 
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={(token) => {
                setTurnstileToken(token);
                setErrorMsg('');
              }}
              onError={() => setErrorMsg("Error en la verificación de seguridad.")}
              options={{ theme: 'light' }}
            />
          </div>

          <button type="submit" disabled={cargando || !turnstileToken} className="btn-final">
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