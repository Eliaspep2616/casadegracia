import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import CryptoJS from 'crypto-js';

// ✅ ELIMINAMOS EL IMPORT QUE DECÍA: import ScannerStaff from './components/ScannerStaff';

const ScannerStaff = () => {
  const [scannedData, setScannedData] = useState(null);
  const SECRET_KEY = "Iglesia_Kenzo_2026_Segura"; 

  useEffect(() => {
    // Configuramos el scanner
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true
    });

    scanner.render(async (lectura) => {
      try {
        // 1. Separar ID y Firma
        const [id, firmaRecibida] = lectura.split('|');

        if (!id || !firmaRecibida) {
          return setScannedData({ nombre: "ERROR", mensaje: "🚫 Formato de QR inválido", tipo: 'error' });
        }

        // 2. Validar Firma (Seguridad Offline)
        const firmaValidada = CryptoJS.HmacSHA256(id, SECRET_KEY).toString();
        if (firmaRecibida !== firmaValidada) {
          return setScannedData({ nombre: "DESCONOCIDO", mensaje: "🚫 QR FALSO O MANIPULADO", tipo: 'error' });
        }

        // 3. Validar y Quemar en DB (Seguridad Online Atómica)
        const { data, error } = await supabase.rpc('validar_y_usar_ticket', { _ticket_id: id });
        
        if (error) throw error;

        const res = data[0];
        setScannedData({ 
          nombre: res.nombre_asistente, 
          mensaje: res.mensaje, 
          tipo: res.status === 'exito' ? 'success' : 'error' 
        });

      } catch (err) {
        console.error("Error en escaneo:", err);
        alert("Error de conexión: " + err.message);
      }
    });

    // Limpieza al desmontar el componente
    return () => {
      scanner.clear().catch(error => console.error("Error al limpiar scanner:", error));
    };
  }, []);

  return (
    <div className="card">
      <h2 style={{ color: 'white' }}>Lector de Entradas 🏎️</h2>
      
      {/* Contenedor del video de la cámara */}
      <div id="reader" style={{ width: '100%' }}></div>
      
      {scannedData && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          borderRadius: '10px',
          border: `2px solid ${scannedData.tipo === 'success' ? '#4ade80' : '#f87171'}`,
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: 'white',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{scannedData.nombre}</h4>
          <p style={{ margin: '0 0 15px 0' }}>{scannedData.mensaje}</p>
          <button 
            onClick={() => setScannedData(null)}
            style={{
              padding: '8px 20px',
              backgroundColor: '#e63946',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Escanear siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default ScannerStaff;