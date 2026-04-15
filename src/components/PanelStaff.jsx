import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';
import ScannerStaff from './ScannerStaff';
const PanelStaff = () => {
  const [autorizado, setAutorizado] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);
  const [tabActual, setTabActual] = useState('asistentes'); // 'asistentes' o 'gestion'
  const [loginData, setLoginData] = useState({ usuario: '', password: '' });
  const [asistentes, setAsistentes] = useState([]);
  const [listaStaff, setListaStaff] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Estados para nuevos registros
  const [nuevoAsistente, setNuevoAsistente] = useState({ nombre: '', cedula: '', telefono: '' });
  const [nuevoStaff, setNuevoStaff] = useState({ usuario: '', password: '', rol: 'staff' });

  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const intentarAcceso = async (e) => {
    e.preventDefault();
    setCargando(true);
    const { data, error } = await supabase
      .from('staff_autorizado')
      .select('*')
      .eq('usuario', loginData.usuario)
      .eq('password_staff', loginData.password)
      .maybeSingle();

    if (data) {
      setAutorizado(true);
      if (data.rol === 'admin') setEsAdmin(true);
      fetchAsistentes();
      if (data.rol === 'admin') fetchStaff();
    } else {
      alert("Acceso denegado: Usuario o contraseña incorrectos");
    }
    setCargando(false);
  };

  const fetchAsistentes = async () => {
    const { data } = await supabase.from('registrados').select('*').order('created_at', { ascending: false });
    setAsistentes(data || []);
  };

  const fetchStaff = async () => {
    const { data } = await supabase.from('staff_autorizado').select('*');
    setListaStaff(data || []);
  };

  // --- ACCIONES DE ASISTENTES ---
 const registrarAsistenteManual = async (e) => {
  e.preventDefault();
  setCargando(true); // Evita doble clic

  const parametros = {
    _evento_id: '42362cfe-8d10-414f-adb1-7310cec5f7f9',
    _nombre: nuevoAsistente.nombre,
    _cedula: nuevoAsistente.cedula,
    _correo: 'registro.manual@iglesia.com', // Correo genérico para staff
    _telefono: nuevoAsistente.telefono || 'S/N'
  };

  try {
    // Usamos el RPC para que el stock baje automáticamente
    const { data, error } = await supabase.rpc('comprar_ticket_seguro', parametros);

    if (error) throw error;

    if (data.status === 'success') {
      alert("✅ Entrada agregada y stock actualizado");
      setNuevoAsistente({ nombre: '', cedula: '', telefono: '' });
      fetchAsistentes(); // Recargamos la tabla
      consultarStock();  // Actualizamos el número de "disponibles"
    } else {
      alert("⚠️ Error: " + data.mensaje);
    }
  } catch (err) {
    console.error("Error al registrar:", err.message);
    alert("No se pudo registrar la entrada");
  } finally {
    setCargando(false);
  }
};

  const actualizarDato = async (id, campo, valor) => {
    await supabase.from('registrados').update({ [campo]: valor }).eq('id', id);
  };

  const confirmarPago = async (id) => {
    await supabase.from('registrados').update({ pagado: true }).eq('id', id);
    fetchAsistentes();
  };

  // --- ACCIONES DE ADMIN ---
  const crearStaff = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('staff_autorizado').insert([{
      usuario: nuevoStaff.usuario,
      password_staff: nuevoStaff.password,
      rol: nuevoStaff.rol
    }]);
    if (error) alert("Error: El usuario ya existe");
    else {
      alert("Servidor creado con éxito");
      fetchStaff();
    }
  };

  const eliminarStaff = async (id) => {
    if(window.confirm("¿Eliminar este acceso?")) {
      await supabase.from('staff_autorizado').delete().eq('id', id);
      fetchStaff();
    }
  };

  const descargarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(asistentes);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistentes Iglesia");
    XLSX.writeFile(wb, "Reporte_Iglesia.xlsx");
  };

if (!autorizado) {
  return (
    <div className="login-admin-page">
      <div className="login-admin-card">
        <h3 style={{marginBottom: '20px'}}>Panel de Control ⛪</h3>
        <form onSubmit={intentarAcceso} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          <input type="text" name="usuario" placeholder="Usuario" onChange={handleLoginChange} className="admin-input" required />
          <input type="password" name="password" placeholder="Contraseña" onChange={handleLoginChange} className="admin-input" required />
          <button type="submit" className="btn-login-active">{cargando ? "Cargando..." : "Entrar"}</button>
        </form>
      </div>
    </div>
  );
}

return (
  <div className="staff-dashboard">
    <div className="dashboard-container">
      
      <div className="dashboard-header">
        <h2>{esAdmin ? "Panel Administrador 👑" : "Panel Staff ⛪"}</h2>
        <button onClick={descargarExcel} className="btn-excel">Descargar Excel</button>
      </div>

      {/* TABS */}
      <div className="tabs-admin">
        <button 
          onClick={() => setTabActual('asistentes')} 
          className={`tab-btn ${tabActual === 'asistentes' ? 'active' : ''}`}
        >
          Asistentes
        </button>
        {esAdmin && (
          <button 
            onClick={() => setTabActual('gestion')} 
            className={`tab-btn ${tabActual === 'gestion' ? 'active' : ''}`}
          >
            Gestionar Equipo
          </button>
        )}
      </div>

      {tabActual === 'asistentes' ? (
        <>
          {/* Registro Manual */}
          <form onSubmit={registrarAsistenteManual} className="registro-rapido">
            <input placeholder="Nombre" value={nuevoAsistente.nombre} onChange={e => setNuevoAsistente({...nuevoAsistente, nombre: e.target.value})} required />
            <input placeholder="Cédula" value={nuevoAsistente.cedula} onChange={e => setNuevoAsistente({...nuevoAsistente, cedula: e.target.value})} required />
            <button type="submit" className="btn-active">+ Agregar</button>
          </form>

          {/* Tabla */}
          <div style={{ overflowX: 'auto' }}>
            <table className="tabla-asistentes">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Pago</th>
                  <th>Ingreso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asistentes.map(a => (
                  <tr key={a.id}>
                    <td>
                      <input 
                        defaultValue={a.nombre} 
                        onBlur={(e) => actualizarDato(a.id, 'nombre', e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#334155', fontWeight: '600' }}
                      />
                    </td>
                    <td>
                      <span className={`badge-pago ${a.pagado ? 'pago-pagado' : 'pago-pendiente'}`}>
                        {a.pagado ? "PAGADO" : "PENDIENTE"}
                      </span>
                    </td>
                    <td>{a.usado ? "🚩 ADENTRO" : "🟢 AFUERA"}</td>
                    <td>
                      {!a.pagado && <button onClick={() => confirmarPago(a.id)} className="btn-validar-mini">Validar</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="gestion-equipo">
          {/* Aquí va tu código de gestión de equipo con clases similares */}
        </div>
      )}
    </div>
  </div>
);
return (
    <div className="staff-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>{esAdmin ? "Panel Administrador 👑" : "Panel Staff ⛪"}</h2>
          <button onClick={descargarExcel} className="btn-excel">Descargar Excel</button>
        </div>

        {/* NAVEGACIÓN POR TABS */}
        <div className="tabs-admin">
          <button 
            onClick={() => setTabActual('asistentes')} 
            className={`tab-btn ${tabActual === 'asistentes' ? 'active' : ''}`}
          >
            📋 Lista Asistentes
          </button>
          
          <button 
            onClick={() => setTabActual('scanner')} 
            className={`tab-btn ${tabActual === 'scanner' ? 'active' : ''}`}
          >
            📷 Escanear QR
          </button>

          {esAdmin && (
            <button 
              onClick={() => setTabActual('gestion')} 
              className={`tab-btn ${tabActual === 'gestion' ? 'active' : ''}`}
            >
              ⚙️ Gestionar Equipo
            </button>
          )}
        </div>

        {/* CONTENIDO CONDICIONAL */}
        {tabActual === 'asistentes' && (
           <div className="asistentes-view">
             {/* Tu formulario de agregar y la tabla que ya tienes */}
           </div>
        )}

        {tabActual === 'scanner' && (
           <div className="scanner-view-container">
             {/* LLAMAMOS A TU COMPONENTE AQUÍ */}
             <ScannerStaff /> 
           </div>
        )}

        {tabActual === 'gestion' && esAdmin && (
           <div className="gestion-view">
             {/* Tu lógica de gestión de staff */}
           </div>
        )}
      </div>
    </div>
  );

};

export default PanelStaff;