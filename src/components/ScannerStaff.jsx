import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import CryptoJS from 'crypto-js';
import './StaffStyles.css';

const ScannerStaff = () => {
  const [asistente, setAsistente] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef(null);
  const ultimoEscaneoValido = useRef(0);
  const SECRET_KEY = "IglesiCDG@";

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner("reader", { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        });
        scannerRef.current.render(manejarLectura);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Error al limpiar", err));
        scannerRef.current = null;
      }
    };
  }, []);

  const manejarLectura = async (lectura) => {
    const ahora = Date.now();
    if (isProcessing || asistente) return;
    setIsProcessing(true);
if (ahora - ultimoEscaneoValido.current < 3000 || asistente) {
    return;
  }
    try {
      const partes = lectura.split('|');
      if (partes.length !== 2) throw new Error("FRAUDE");

      const id = partes[0];
      const firmaEscaneada = partes[1];
      const firmaCalculada = CryptoJS.HmacSHA256(id, SECRET_KEY).toString();

      if (firmaEscaneada !== firmaCalculada) throw new Error("FRAUDE_FIRMA");

      const { data, error } = await supabase.from('registrados').select('*').eq('id', id).single();
      if (error || !data) throw new Error("NO_ENCONTRADO");

      setAsistente(data);
      ultimoEscaneoValido.current = ahora;
    } catch (err) {
      alert("⚠️ Ticket inválido o error de conexión.");
      setIsProcessing(false);
      
    }
  };

  const confirmarIngreso = async (e) => {
    e.stopPropagation(); // Evita interferencias con el escáner
    if (!asistente) return;

    const { error } = await supabase
      .from('registrados')
      .update({ usado: true, usado_at: new Date().toISOString() })
      .eq('id', asistente.id);

    if (!error) {
      alert(`✅ Bienvenido, ${asistente.nombre}`);
      resetearScanner();
    } else {
      alert("❌ Error al registrar.");
    }
  };

  const resetearScanner = (e) => {
    if (e) e.stopPropagation();
    setAsistente(null);
    setIsProcessing(true); // Bloqueo de seguridad
    setTimeout(() => setIsProcessing(false), 1500); 
  };

  return (
    <div className="scanner-pro-view">
      <div className="scanner-header">
        <h3>Lector de Entradas CDG 📷</h3>
      </div>

      <div id="reader" className="reader-container" style={{ display: asistente ? 'none' : 'block' }}></div>
      
      {asistente && (
        <div className="confirmation-overlay">
          <div className="confirmation-card">
            <h3 className="status-label">CONFIRMAR IDENTIDAD</h3>
            <h1 className="assistant-name">{asistente.nombre}</h1>

            <div className="entries-box">
              <p>ENTRADAS:</p>
              <h2 className="entries-count">{asistente.cantidad}</h2>
            </div>

            <p className={asistente.pagado ? 'text-paid' : 'text-unpaid'}>
              {asistente.pagado ? '✅ PAGO VERIFICADO' : '❌ PAGO PENDIENTE'}
            </p>

            {asistente.usado && (
              <div className="status-used">⚠️ TICKET YA UTILIZADO</div>
            )}

            <div className="btn-group">
              <button className="btn-base btn-cancel" onClick={resetearScanner}>
                CANCELAR
              </button>

              <button 
                className="btn-base btn-accept" 
                onClick={confirmarIngreso}
                disabled={asistente.usado || !asistente.pagado}
              >
                DAR PASO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScannerStaff;