import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';

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
    const { error } = await supabase.from('registrados').insert([{
      nombre: nuevoAsistente.nombre,
      cedula: nuevoAsistente.cedula,
      telefono: nuevoAsistente.telefono,
      pagado: true, // Se asume que si compra en persona, paga al instante
      evento_id: '42362cfe-8d10-414f-adb1-7310cec5f7f9'
    }]);
    if (!error) {
      alert("Asistente registrado");
      setNuevoAsistente({ nombre: '', cedula: '', telefono: '' });
      fetchAsistentes();
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
      <div className="card">
        <h3>Panel de Control ⛪</h3>
        <form onSubmit={intentarAcceso}>
          <input type="text" name="usuario" placeholder="Usuario" onChange={handleLoginChange} required />
          <input type="password" name="password" placeholder="Contraseña" onChange={handleLoginChange} required />
          <button type="submit" className="btn-active">{cargando ? "Cargando..." : "Entrar"}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '1100px', width: '95%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{esAdmin ? "Panel Administrador 👑" : "Panel Staff ⛪"}</h2>
        <button onClick={descargarExcel} style={{ background: '#4ade80', color: 'black', fontSize: '0.8rem' }}>Descargar Excel</button>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        <button onClick={() => setTabActual('asistentes')} style={{ flex: 1, background: tabActual === 'asistentes' ? '#e63946' : '#333' }}>Asistentes</button>
        {esAdmin && <button onClick={() => setTabActual('gestion')} style={{ flex: 1, background: tabActual === 'gestion' ? '#e63946' : '#333' }}>Gestionar Equipo</button>}
      </div>

      {tabActual === 'asistentes' ? (
        <>
          {/* Registro Manual */}
          <form onSubmit={registrarAsistenteManual} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input style={{ flex: 1 }} placeholder="Nombre" value={nuevoAsistente.nombre} onChange={e => setNuevoAsistente({...nuevoAsistente, nombre: e.target.value})} required />
            <input style={{ flex: 1 }} placeholder="Cédula" value={nuevoAsistente.cedula} onChange={e => setNuevoAsistente({...nuevoAsistente, cedula: e.target.value})} required />
            <button type="submit" style={{ background: '#e63946' }}>+ Agregar</button>
          </form>

          {/* Tabla Interactiva */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #444', textAlign: 'left' }}>
                  <th>Nombre (Editar)</th>
                  <th>Pago</th>
                  <th>Ingreso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asistentes.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #222' }}>
                    <td>
                      <input 
                        defaultValue={a.nombre} 
                        onBlur={(e) => actualizarDato(a.id, 'nombre', e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', width: '100%' }}
                      />
                    </td>
                    <td style={{ color: a.pagado ? '#4ade80' : '#fbbf24' }}>{a.pagado ? "PAGADO" : "PENDIENTE"}</td>
                    <td>{a.usado ? "🚩 ADENTRO" : "🟢 AFUERA"}</td>
                    <td>
                      {!a.pagado && <button onClick={() => confirmarPago(a.id)} style={{ padding: '4px 8px' }}>Validar</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* GESTIÓN DE EQUIPO (Solo Admin) */
        <div>
          <h3>Nuevo Miembro del Staff</h3>
          <form onSubmit={crearStaff} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
            <input placeholder="Usuario" onChange={e => setNuevoStaff({...nuevoStaff, usuario: e.target.value})} required />
            <input type="password" placeholder="Pass" onChange={e => setNuevoStaff({...nuevoStaff, password: e.target.value})} required />
            <select onChange={e => setNuevoStaff({...nuevoStaff, rol: e.target.value})} style={{ background: '#000', color: 'white' }}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit">Guardar</button>
          </form>
          
          <table style={{ width: '100%' }}>
            {listaStaff.map(s => (
              <tr key={s.id}>
                <td>{s.usuario}</td>
                <td>{s.rol}</td>
                <td><button onClick={() => eliminarStaff(s.id)} style={{ background: 'none', color: '#e63946' }}>Eliminar</button></td>
              </tr>
            ))}
          </table>
        </div>
      )}
    </div>
  );
};

export default PanelStaff;