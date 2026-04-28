import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import QRCode from 'qrcode'; // 👈 Usamos la librería segura
import * as XLSX from 'xlsx';
import ScannerStaff from './ScannerStaff';
import FormularioTaquilla from './FormularioTaquilla';
import './StaffStyles.css';

const LoginAdmin = ({ onEntrar }) => {
  const [credenciales, setCredenciales] = useState({ usuario: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credenciales.usuario,
        password: credenciales.password,
      });

      if (error) {
        setErrorMsg('Usuario o contraseña incorrectos.');
      } else {
        onEntrar(data.user); 
      }
    } catch (err) {
      setErrorMsg('Error de conexión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f1f5f9'}}>
      <form onSubmit={manejarLogin} style={{background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 10px 25px rgba(0,0,0,0.1)', width:'100%', maxWidth:'350px'}}>
        <h2 style={{textAlign:'center', color:'#1e293b', marginBottom:'20px'}}>Staff Login 🔐</h2>
        <input 
          type="email" placeholder="Correo del Staff" required 
          style={{width:'100%', padding:'12px', marginBottom:'15px', borderRadius:'8px', border:'1px solid #cbd5e1', boxSizing:'border-box'}}
          onChange={(e) => setCredenciales({...credenciales, usuario: e.target.value})} 
        />
        <input 
          type="password" placeholder="Contraseña" required 
          style={{width:'100%', padding:'12px', marginBottom:'15px', borderRadius:'8px', border:'1px solid #cbd5e1', boxSizing:'border-box'}}
          onChange={(e) => setCredenciales({...credenciales, password: e.target.value})} 
        />
        {errorMsg && <p style={{color: '#ef4444', fontSize: '0.85rem', marginBottom:'15px', textAlign:'center'}}>{errorMsg}</p>}
        <button type="submit" disabled={cargando} style={{width:'100%', padding:'14px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>
          {cargando ? 'VERIFICANDO...' : 'ACCEDER AL PANEL'}
        </button>
      </form>
    </div>
  );
};

const PanelStaff = () => {
  const [staffLogueado, setStaffLogueado] = useState(null);
  const [asistentes, setAsistentes] = useState([]);
  const [tabActual, setTabActual] = useState('asistentes');
  const [modalRegistro, setModalRegistro] = useState(false);
  const [metodoPagoValidar, setMetodoPagoValidar] = useState('Transferencia');
  const [precioEvento, setPrecioEvento] = useState(25);
  const [busqueda, setBusqueda] = useState('');

  const EVENTO_ID = '42362cfe-8d10-414f-adb1-7310cec5f7f9';

  useEffect(() => {
    const inicializar = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setStaffLogueado(session.user);
      fetchPrecio();
      fetchAsistentes();
    };
    
    inicializar();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setStaffLogueado(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPrecio = async () => {
    const { data } = await supabase.from('eventos').select('precio_unitario').eq('id', EVENTO_ID).single();
    if (data) setPrecioEvento(data.precio_unitario);
  };

  const fetchAsistentes = async () => {
    const { data } = await supabase.from('registrados').select('*').order('created_at', { ascending: false });
    if (data) setAsistentes(data);
  };

  // 🛡️ FUNCIÓN SEGURA PARA DESCARGAR QR
  const descargarQR = async (id, nombre) => {
    try {
      // Pedimos la firma a Supabase (así no exponemos la contraseña en React)
      const { data: qrData, error } = await supabase.rpc('obtener_firma_ticket', { 
        p_ticket_id: id 
      });

      if (error) throw error;

      // Generamos la imagen con la librería qrcode
      const imageUrl = await QRCode.toDataURL(qrData, { 
        width: 512, 
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' }
      });

      // Forzamos la descarga
      const downloadLink = document.createElement("a");
      downloadLink.href = imageUrl;
      downloadLink.download = `Ticket_CDG_${nombre.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

    } catch (err) {
      console.error(err);
      alert("❌ Error de seguridad al generar el ticket.");
    }
  };

  // 🗑️ FUNCIÓN PARA ELIMINAR ASISTENTE
  const eliminarAsistente = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${nombre}? Esta acción es permanente.`)) {
      const { error } = await supabase
        .from('registrados')
        .delete()
        .eq('id', id);

      if (!error) {
        alert("✅ Registro eliminado con éxito.");
        fetchAsistentes();
      } else {
        alert("❌ Error al eliminar el registro.");
      }
    }
  };

  const validarConMetodo = async (id, cantidad, email, nombre) => {
    if (window.confirm(`¿Validar $${(cantidad * precioEvento).toFixed(2)} y enviar correo a ${nombre}?`)) {
      
      const { error: updateError } = await supabase.from('registrados').update({ 
        pagado: true, 
        metodo_pago: metodoPagoValidar,
        total_pagado: cantidad * precioEvento,
        fecha_pago: new Date().toISOString()
        
      }).eq('id', id);

      if (!updateError) {
        const { data: { session } } = await supabase.auth.getSession();

        try {
          const respuesta = await fetch('https://lzvolnnndwpyxyoyldea.supabase.co/functions/v1/enviar-ticket', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}` 
            },
            body: JSON.stringify({ 
              email: email, 
              nombre: nombre, 
              ticket_id: id 
            })
          });

          const datosRespuesta = await respuesta.json();

          if (!respuesta.ok) {
            console.error("Error exacto del servidor:", datosRespuesta);
            alert(`✅ Pago registrado, pero hubo un error con el correo:\n\n${datosRespuesta.error}`);
          } else {
            alert("✅ ¡Validado y Correo Enviado!");
          }
        } catch (err) {
          console.error("Fallo de red:", err);
          alert("✅ Pago registrado. (Error de red al intentar enviar el correo).");
        }
        
        fetchAsistentes();
      } else {
        alert("❌ Error al actualizar el pago en la base de datos.");
      }
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setStaffLogueado(null);
  };

  const asistentesFiltrados = asistentes.filter(a => {
    const termino = busqueda.toLowerCase();
    return (
      (a.nombre && a.nombre.toLowerCase().includes(termino)) ||
      (a.correo && a.correo.toLowerCase().includes(termino)) ||
      (a.cedula && a.cedula.includes(termino)) ||
      (a.telefono && a.telefono.includes(termino))
    );
  });

  const stats = asistentes.reduce((acc, a) => {
    acc.totalCompradas += a.cantidad;
    if (a.pagado) acc.pagadas += a.cantidad;
    if (!a.pagado) acc.porValidar += a.cantidad;
    if (a.usado) acc.adentro += a.cantidad; 
    return acc;
  }, { totalCompradas: 0, pagadas: 0, porValidar: 0, adentro: 0 });

  const exportarExcel = () => {
    const datosExcel = asistentesFiltrados.map(a => ({
      "Nombre": a.nombre,
      "Cédula": a.cedula || 'N/A',
      "Teléfono": a.telefono || 'N/A',
      "Correo": a.correo,
      "Entradas": a.cantidad,
      "Total": `$${(a.cantidad * precioEvento).toFixed(2)}`,
      "Estado Pago": a.pagado ? 'PAGADO' : 'PENDIENTE',
      "Ubicación": a.usado ? 'ADENTRO' : 'AFUERA',
      "Registro": new Date(a.created_at).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ListaAsistentes");
    
    ws['!cols'] = [{wch:25}, {wch:15}, {wch:15}, {wch:30}, {wch:10}, {wch:10}, {wch:15}, {wch:15}, {wch:15}];
    
    XLSX.writeFile(wb, `Reporte_Retiro_${new Date().toLocaleDateString()}.xlsx`);
  };

  if (!staffLogueado) return <LoginAdmin onEntrar={(datos) => setStaffLogueado(datos)} />;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <h1 style={{margin:0, color:'#1e293b'}}>Retiro de Provisión</h1>
          <p style={{margin:0, color:'#64748b'}}>Staff: <b>{staffLogueado.email}</b> | Precio: ${precioEvento}</p>
        </div>
        <button onClick={cerrarSesion} className="btn-action-logout">Cerrar Sesión</button>
      </header>

      {tabActual === 'asistentes' && (
        <div style={{display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap'}}>
          <div className="stat-card" style={{borderLeft: '4px solid #3b82f6'}}>
            <p>TOTAL VENDIDAS</p>
            <h2>{stats.totalCompradas}</h2>
          </div>
          <div className="stat-card" style={{borderLeft: '4px solid #f59e0b'}}>
            <p>POR VALIDAR</p>
            <h2>{stats.porValidar}</h2>
          </div>
          <div className="stat-card" style={{borderLeft: '4px solid #10b981'}}>
            <p>EN EL EVENTO</p>
            <h2>{stats.adentro}</h2>
          </div>
        </div>
      )}

      <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'20px', flexWrap: 'wrap'}}>
        <div className="tab-navigation">
          <button onClick={() => setTabActual('asistentes')} className={tabActual === 'asistentes' ? 'tab-btn active' : 'tab-btn'}>📋 Lista</button>
          <button onClick={() => setTabActual('scanner')} className={tabActual === 'scanner' ? 'tab-btn active' : 'tab-btn'}>📷 Escáner</button>
        </div>
        
        {tabActual === 'asistentes' && (
          <>
            <input 
              type="text" 
              placeholder="🔍 Buscar por nombre, cédula, correo..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
            <button onClick={exportarExcel} className="btn-excel-dl">Descargar Excel</button>
            <button onClick={() => setModalRegistro(true)} className="btn-new-sale">➕ Nueva Venta</button>
          </>
        )}
      </div>

      <main>
        {tabActual === 'asistentes' ? (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Asistente</th>
                  <th>Cédula / Teléfono</th>
                  <th>Cant.</th>
                  <th>Pago</th>
                  <th>Estado</th>
                  <th>Ubicación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asistentesFiltrados.map(a => (
                  <tr key={a.id}>
                    <td><b>{a.nombre}</b><br/><small>{a.correo}</small></td>
                    <td>
                        <span style={{fontSize: '0.9rem'}}>{a.cedula || 'N/A'}</span><br/>
                        <small style={{color: '#25d366', fontWeight: 'bold'}}>{a.telefono || 'Sin teléfono'}</small>
                    </td>
                    <td>{a.cantidad}</td>
                    <td>${(a.cantidad * precioEvento).toFixed(2)}</td>
                    <td><span className={`status-pill ${a.pagado ? 'paid' : 'unpaid'}`}>{a.pagado ? 'PAGADO' : 'PENDIENTE'}</span></td>
                    <td>
                      <span className={`badge-location ${a.usado ? 'inside' : 'outside'}`}>
                        {a.usado ? '✅ ADENTRO' : '🏠 AFUERA'}
                      </span>
                    </td>
                    <td className="action-cell">
                      {/* Botón de Validar Pago */}
                      {!a.pagado && (
                        <button 
                          onClick={() => validarConMetodo(a.id, a.cantidad, a.correo, a.nombre)} 
                          className="btn-icon check" 
                          title="Marcar como Pagado"
                        >
                          ✓
                        </button>
                      )}
                      
                      {/* Botón de Descargar QR (Solo visible si ya pagó) */}
                      {a.pagado && (
                        <button 
                          onClick={() => descargarQR(a.id, a.nombre)} 
                          className="btn-icon qr" 
                          title="Descargar Ticket QR"
                        >
                          📥
                        </button>
                      )}

                      {/* Botón de Eliminar */}
                      <button 
                        onClick={() => eliminarAsistente(a.id, a.nombre)} 
                        className="btn-icon trash" 
                        title="Eliminar Registro"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <ScannerStaff />}
      </main>

      {modalRegistro && (
        <div className="taquilla-overlay">
          <div className="taquilla-modal">
            <button className="btn-cerrar-taquilla" onClick={() => setModalRegistro(false)}>✕</button>
            <FormularioTaquilla 
              onExito={() => {
                setModalRegistro(false);
                fetchAsistentes(); 
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelStaff;