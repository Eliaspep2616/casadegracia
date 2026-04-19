import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import CryptoJS from 'crypto-js';

const FormularioTaquilla = ({ onExito }) => {
  const [cargando, setCargando] = useState(false);
  const [precioReal, setPrecioReal] = useState(0); 
  const [cargandoPrecio, setCargandoPrecio] = useState(true);
  
  const EVENTO_ID = '42362cfe-8d10-414f-adb1-7310cec5f7f9';
  const SECRET_KEY = "IglesiCDG@"; // 👈 Necesario para firmar el QR

  const [form, setForm] = useState({
    nombre: '',
    cedula: '', 
    correo: '',   // 👈 Nuevo campo
    telefono: '', // 👈 Nuevo campo
    cantidad: 1
  });

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
        setPrecioReal(5.00); 
      }
      setCargandoPrecio(false);
    };
    fetchPrecio();
  }, []);

  const manejarVentaFisica = async (e) => {
    e.preventDefault();
    setCargando(true);

    const totalCobrado = form.cantidad * precioReal; 
    
    // Si dejan el correo/teléfono vacío, usamos valores por defecto
    const correoFinal = form.correo.trim() !== '' ? form.correo.trim() : 'compra_fisica@iglesia.com';
    const telefonoFinal = form.telefono.trim() !== '' ? form.telefono.trim() : 'N/A';

    try {
      // 1. Guardar en la base de datos y OBTENER el ID generado (.select())
      const { data: registroGuardado, error } = await supabase.from('registrados').insert([{
        evento_id: EVENTO_ID,
        nombre: form.nombre,
        cedula: form.cedula || 'N/A',
        correo: correoFinal, 
        telefono: telefonoFinal,
        cantidad: parseInt(form.cantidad),
        pagado: true, 
        total_pagado: totalCobrado,
        metodo_pago: 'Efectivo',
        fecha_pago: new Date()
      }]).select(); // 👈 El select() es crucial para que nos devuelva el ID de este nuevo usuario

      if (error) throw error;
      
      const nuevoAsistente = registroGuardado[0];

      // 2. Si se ingresó un correo real, enviamos el ticket automáticamente
      if (correoFinal !== 'compra_fisica@iglesia.com') {
        const qrFirmado = `${nuevoAsistente.id}|${CryptoJS.HmacSHA256(nuevoAsistente.id, SECRET_KEY).toString()}`;
        const { data: { session } } = await supabase.auth.getSession();

        const respuesta = await fetch('https://lzvolnnndwpyxyoyldea.supabase.co/functions/v1/enviar-ticket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}` 
          },
          body: JSON.stringify({ 
            email: correoFinal, 
            nombre: form.nombre, 
            qr_data: qrFirmado 
          })
        });

        const datosRespuesta = await respuesta.json();

        if (!respuesta.ok) {
          alert(`✅ Guardado en BD, pero hubo un error enviando el correo:\n${datosRespuesta.error}`);
        } else {
          alert("✅ ¡Venta registrada y Ticket enviado al correo!");
        }
      } else {
        alert("✅ ¡Venta registrada exitosamente (Sin envío de correo)!");
      }

      // 3. Cerrar modal y actualizar tabla
      onExito(); 

    } catch (error) {
      alert("❌ Error al registrar: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <h2 style={{ color: '#0f172a', marginBottom: '5px' }}>Taquilla Presencial 💵</h2>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        Registro rápido para pagos en efectivo. Precio actual: 
        <b> {cargandoPrecio ? '...' : `$${precioReal.toFixed(2)}`}</b>
      </p>

      <form onSubmit={manejarVentaFisica} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>
            Nombre del Asistente *
          </label>
          <input 
            type="text" 
            required 
            autoFocus
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem', boxSizing: 'border-box' }}
            placeholder="Ej: Doña María" 
            onChange={e => setForm({...form, nombre: e.target.value})} 
          />
        </div>

        {/* 👈 NUEVA FILA: Teléfono y Correo */}
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '45%' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>
              Teléfono (WhatsApp)
            </label>
            <input 
              type="text" 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem', boxSizing: 'border-box' }}
              placeholder="09..." 
              onChange={e => setForm({...form, telefono: e.target.value})} 
            />
          </div>

          <div style={{ flex: 1, minWidth: '45%' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>
              Correo (Para enviar ticket)
            </label>
            <input 
              type="email" 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem', boxSizing: 'border-box' }}
              placeholder="ejemplo@correo.com" 
              onChange={e => setForm({...form, correo: e.target.value})} 
            />
          </div>
        </div>

        {/* FILA ORIGINAL: Cédula y Cantidad */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>
              Cédula (Opcional)
            </label>
            <input 
              type="text" 
              maxLength="10"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem', boxSizing: 'border-box' }}
              placeholder="1234567890" 
              onChange={e => setForm({...form, cedula: e.target.value})} 
            />
          </div>

          <div style={{ width: '100px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>
              Entradas
            </label>
            <input 
              type="number" 
              min="1" 
              required
              value={form.cantidad}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #004a99', fontSize: '1rem', fontWeight: 'bold', textAlign: 'center', boxSizing: 'border-box' }}
              onChange={e => setForm({...form, cantidad: e.target.value})} 
            />
          </div>
        </div>

        <div style={{ marginTop: '10px', padding: '15px', background: '#f1f5f9', borderRadius: '10px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Cobrar en Efectivo:</span><br/>
          <strong style={{ fontSize: '1.8rem', color: '#16a34a' }}>
            {cargandoPrecio ? '...' : `$${(form.cantidad * precioReal).toFixed(2)}`}
          </strong>
        </div>

        <button 
          type="submit" 
          disabled={cargando || cargandoPrecio}
          style={{ width: '100%', padding: '16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '10px' }}
        >
          {cargando ? 'PROCESANDO...' : '💰 REGISTRAR PAGO Y ENVIAR'}
        </button>
      </form>
    </div>
  );
};

export default FormularioTaquilla;