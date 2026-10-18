import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { ArrowLeft, Plus, Edit2, Trash2, Link as LinkIcon, FileText, CheckSquare, MessageCircle, EyeOff, Settings, Percent, Calendar } from 'lucide-react';
import { useGestionContenido } from '../../hooks/useGestionContenido';
import './PanelClaseProfesor.css';

const PanelClaseProfesor = ({ rolUsuarioGlobal }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { obtenerEstructuraMateria, guardarElemento, actualizarElemento, eliminarElemento } = useGestionContenido();
  
  // Estados de Asistencia
  const [fechaAsistencia, setFechaAsistencia] = useState(new Date().toISOString().split('T')[0]);
  const [pesoAsistencia, setPesoAsistencia] = useState(0);
  const [todasAsistencias, setTodasAsistencias] = useState([]);
  const [registrosAsistencia, setRegistrosAsistencia] = useState({});
  
  // Estados Generales
  const [loading, setLoading] = useState(true);
  const [pestañaActiva, setPestañaActiva] = useState('planificacion');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [rolUsuario, setRolUsuario] = useState(null); 
  
  const [materia, setMateria] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  
  // Modales y Formularios
  const [modalCategoria, setModalCategoria] = useState(false);
  const [formCategoria, setFormCategoria] = useState({ nombre: '', porcentaje: '' });
  const [actividadSeleccionadaId, setActividadSeleccionadaId] = useState('');
  const [notasTemporales, setNotasTemporales] = useState({});
  const [comentariosTemporales, setComentariosTemporales] = useState({});
  const [editandoNotaId, setEditandoNotaId] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [unidadActivaId, setUnidadActivaId] = useState(null);
  const [modalUnidad, setModalUnidad] = useState(false);
  const [formUnidad, setFormUnidad] = useState({ titulo: '', orden: 1 });
  const [modalRecurso, setModalRecurso] = useState(false);
  const [formRecurso, setFormRecurso] = useState({ titulo: '', url: '', tipo: 'link' });
  const [modalActividad, setModalActividad] = useState(false);
  const [formActividad, setFormActividad] = useState({ titulo: '', descripcion: '', tipo: 'tarea', apertura: '', cierre: '', visible: true, permite_atrasos: true, categoria_id: '' });

  // 1. CARGA DE DATOS CORREGIDA
  const cargarDatos = async () => {
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: perfilUsuario } = await supabase.from('perfiles').select('rol').eq('id', session.user.id).single();
      if (perfilUsuario) {
        setRolUsuario(perfilUsuario.rol);
        if (perfilUsuario.rol === 'director' || perfilUsuario.rol === 'admin') setModoEdicion(true);
      }
    }
    
    // Cargar Materia (Incluyendo peso_asistencia)
    const { data: matData } = await supabase.from('materias').select('id, nombre_materia, nivel_id, fecha_cierre_notas, peso_asistencia').eq('id', id).single();
    if (matData) {
      setMateria(matData);
      setPesoAsistencia(matData.peso_asistencia || 0);
    }

    // Cargar Historial de Asistencias
    const { data: asistenciasCompletas } = await supabase.from('asistencias').select('*').eq('materia_id', id);
    if (asistenciasCompletas) setTodasAsistencias(asistenciasCompletas);

    // Cargar Categorías
    const { data: catData } = await supabase.from('categorias_notas').select('*').eq('materia_id', id);
    if (catData) setCategorias(catData);

    // Cargar Unidades
    try {
      const estructura = await obtenerEstructuraMateria(id);
      setUnidades(estructura || []);
      if (estructura && estructura.length > 0) {
         const primeraActividad = estructura.flatMap(u => u.actividades).find(a => a.tipo === 'tarea');
         if (primeraActividad) setActividadSeleccionadaId(primeraActividad.id);
      }
    } catch (err) { console.error(err); }

    // Cargar Alumnos
    if (matData?.nivel_id) {
      const { data: matriculasData } = await supabase.from('matriculas').select('estudiante:perfiles(id, nombre_completo, cedula)').eq('nivel_id', matData.nivel_id).eq('estado', 'activo');
      if (matriculasData) setAlumnos(matriculasData.map(m => m.estudiante));
    }

    // Cargar Entregas
    const { data: entregasData } = await supabase.from('entregas_tareas').select('*');
    if (entregasData) setEntregas(entregasData);

    setLoading(false);
  };

  useEffect(() => { cargarDatos(); }, [id]);

  // 2. LÓGICA DE ASISTENCIA DIARIA
  useEffect(() => {
    const cargarAsistenciaDiaria = async () => {
      const { data } = await supabase.from('asistencias').select('estudiante_id, estado').eq('materia_id', id).eq('fecha', fechaAsistencia);
      if (data) {
        const previas = {};
        data.forEach(item => previas[item.estudiante_id] = item.estado);
        setRegistrosAsistencia(previas);
      } else { setRegistrosAsistencia({}); }
    };
    if (pestañaActiva === 'asistencia') cargarAsistenciaDiaria();
  }, [fechaAsistencia, pestañaActiva, id]);

  const handleGuardarAsistencia = async () => {
    const registros = Object.keys(registrosAsistencia)
      .filter(estId => registrosAsistencia[estId] !== '')
      .map(estId => ({ materia_id: id, estudiante_id: estId, fecha: fechaAsistencia, estado: registrosAsistencia[estId] }));

    if (registros.length === 0) return alert("No hay registros de asistencia para guardar.");

    const { error } = await supabase.from('asistencias').upsert(registros, { onConflict: 'materia_id, estudiante_id, fecha' });
    if (!error) { 
      alert("Asistencia guardada con éxito."); 
      cargarDatos(); // Recargar para actualizar el promedio
    } else { alert("Error al guardar asistencia."); }
  };

  const handleGuardarPesoAsistencia = async () => {
    const nuevoPeso = Number(pesoAsistencia);
    const sumaBolsas = categorias.reduce((acc, cat) => acc + Number(cat.porcentaje), 0);
    if (sumaBolsas + nuevoPeso > 100) return alert(`Error: Las bolsas suman ${sumaBolsas}%. Si sumas ${nuevoPeso}%, superas el 100%.`);

    const { error } = await supabase.from('materias').update({ peso_asistencia: nuevoPeso }).eq('id', id);
    if (!error) {
      alert("Porcentaje bloqueado y guardado con éxito.");
      cargarDatos();
    } else alert("Error al guardar el porcentaje.");
  };

  useEffect(() => {
    setNotasTemporales({});
    setComentariosTemporales({});
    setEditandoNotaId(null);
  }, [actividadSeleccionadaId]);

  // 3. CÁLCULOS DE CALIFICACIÓN (CORREGIDOS)
  const esDirector = rolUsuarioGlobal === 'director' || rolUsuarioGlobal === 'admin' || rolUsuario === 'director' || rolUsuario === 'admin';
  const fechaCierreActas = materia?.fecha_cierre_notas ? new Date(materia.fecha_cierre_notas) : null;
  const notasBloqueadas = !esDirector && (fechaCierreActas ? new Date() > fechaCierreActas : false);

  const sumaPorcentajes = categorias.reduce((acc, cat) => acc + Number(cat.porcentaje), 0) + Number(materia?.peso_asistencia || 0);

  const calcularNotaAsistencia = (alumnoId) => {
    const asisAlumno = todasAsistencias.filter(a => a.estudiante_id === alumnoId);
    if (asisAlumno.length === 0) return 0;
    
    let puntos = 0;
    asisAlumno.forEach(a => {
      if (a.estado === 'Presente' || a.estado === 'Justificado') puntos += 100;
      else if (a.estado === 'Atraso') puntos += 50;
    });
    return puntos / asisAlumno.length;
  };

  const calcularPromedioAcumulado = (alumnoId) => {
    let notaFinal = 0;

    categorias.forEach(cat => {
      const actividadesCat = unidades.flatMap(u => u.actividades).filter(a => a.categoria_id == cat.id);
      if (actividadesCat.length === 0) return; 

      let sumaNotasCat = 0;
      let tareasCalificadas = 0;

      actividadesCat.forEach(act => {
        const entrega = entregas.find(e => e.estudiante_id === alumnoId && e.tarea_id === act.id);
        if (entrega && entrega.calificacion != null) {
          sumaNotasCat += Number(entrega.calificacion);
          tareasCalificadas++;
        }
      });

      if (tareasCalificadas > 0) {
        notaFinal += (sumaNotasCat / tareasCalificadas) * (Number(cat.porcentaje) / 100);
      }
    });

    if (materia?.peso_asistencia > 0) {
      notaFinal += calcularNotaAsistencia(alumnoId) * (Number(materia.peso_asistencia) / 100);
    }

    return notaFinal.toFixed(2);
  };

  // 4. FUNCIONES DE EDICIÓN Y GESTIÓN
  const handleGuardarCategoria = async (e) => {
    e.preventDefault();
    const nuevoPorc = Number(formCategoria.porcentaje);
    if (sumaPorcentajes + nuevoPorc > 100) return alert(`¡Alto ahí! La suma total superaría el 100%. Te queda un ${100 - sumaPorcentajes}% disponible.`);
    const { error } = await supabase.from('categorias_notas').insert([{ materia_id: id, nombre: formCategoria.nombre, porcentaje: nuevoPorc }]);
    if (!error) { setModalCategoria(false); setFormCategoria({ nombre: '', porcentaje: '' }); cargarDatos(); }
  };

  const handleEliminarCategoria = async (catId) => {
    if (window.confirm('¿Seguro que deseas eliminar esta categoría?')) { await supabase.from('categorias_notas').delete().eq('id', catId); cargarDatos(); }
  };

  const handleEliminar = async (tabla, itemId) => {
    if (window.confirm('¿Estás seguro de eliminar esto?')) {
      try { await eliminarElemento(tabla, itemId); cargarDatos(); } catch (err) { alert("Error al eliminar."); }
    }
  };

  const abrirEdicionUnidad = (unidad) => { setEditandoId(unidad.id); setFormUnidad({ titulo: unidad.titulo, orden: unidad.orden }); setModalUnidad(true); };
  const abrirEdicionRecurso = (recurso, unidadId) => { setEditandoId(recurso.id); setUnidadActivaId(unidadId); setFormRecurso({ titulo: recurso.titulo, url: recurso.url, tipo: recurso.tipo }); setModalRecurso(true); };
  const abrirEdicionActividad = (actividad, unidadId) => {
    setEditandoId(actividad.id); setUnidadActivaId(unidadId);
    setFormActividad({ titulo: actividad.titulo, descripcion: actividad.descripcion || '', tipo: actividad.tipo, apertura: actividad.apertura ? actividad.apertura.slice(0, 16) : '', cierre: actividad.cierre ? actividad.cierre.slice(0, 16) : '', visible: actividad.visible, permite_atrasos: actividad.permite_atrasos !== undefined ? actividad.permite_atrasos : true, categoria_id: actividad.categoria_id || '' });
    setModalActividad(true);
  };

  const handleGuardarUnidad = async (e) => {
    e.preventDefault();
    if (editandoId) await actualizarElemento('unidades', editandoId, { titulo: formUnidad.titulo, orden: formUnidad.orden });
    else await guardarElemento('unidades', { materia_id: id, titulo: formUnidad.titulo, orden: formUnidad.orden });
    cerrarModales(); cargarDatos();
  };

  const handleGuardarRecurso = async (e) => {
    e.preventDefault();
    if (editandoId) await actualizarElemento('recursos', editandoId, { titulo: formRecurso.titulo, url: formRecurso.url, tipo: formRecurso.tipo });
    else await guardarElemento('recursos', { unidad_id: unidadActivaId, titulo: formRecurso.titulo, url: formRecurso.url, tipo: formRecurso.tipo });
    cerrarModales(); cargarDatos();
  };

  const handleGuardarActividad = async (e) => {
    e.preventDefault();
    if (!formActividad.categoria_id && categorias.length > 0) return alert("Selecciona a qué categoría de notas pertenece.");
    const datos = { titulo: formActividad.titulo, descripcion: formActividad.descripcion, tipo: formActividad.tipo, apertura: formActividad.apertura || null, cierre: formActividad.cierre || null, visible: formActividad.visible === 'true' || formActividad.visible === true, permite_atrasos: formActividad.permite_atrasos === 'true' || formActividad.permite_atrasos === true, categoria_id: formActividad.categoria_id || null };
    if (editandoId) await actualizarElemento('actividades', editandoId, datos);
    else await guardarElemento('actividades', { unidad_id: unidadActivaId, ...datos });
    cerrarModales(); cargarDatos();
    // Dentro de tu handleGuardarActividad, después de guardar en Supabase:
  
  if (!editandoId) { // Solo si es una tarea NUEVA
    try {
      await fetch('URL_DE_TU_WEBHOOK_DE_N8N', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grupo_id: materia.grupo_whatsapp_id, // El ID del grupo de esta materia específica
          materia_nombre: materia.nombre_materia,
          tarea_titulo: formActividad.titulo,
          fecha_cierre: formActividad.cierre
        })
      });
    } catch (err) {
      console.log("La tarea se guardó, pero falló el aviso de WhatsApp");
    }
  }
  };

  const cerrarModales = () => { setModalUnidad(false); setModalRecurso(false); setModalActividad(false); setModalCategoria(false); setEditandoId(null); setFormUnidad({ titulo: '', orden: 1 }); setFormRecurso({ titulo: '', url: '', tipo: 'link' }); setFormActividad({ titulo: '', descripcion: '', tipo: 'tarea', apertura: '', cierre: '', visible: true, permite_atrasos: true, categoria_id: '' }); };

  const getIconoActividad = (tipo) => { if (tipo === 'tarea') return <FileText size={18} color="#e11d48" />; if (tipo === 'examen') return <CheckSquare size={18} color="#0284c7" />; if (tipo === 'foro') return <MessageCircle size={18} color="#16a34a" />; return <FileText size={18} />; };
  const handleVerPDF = async (rutaArchivo) => { const { data } = await supabase.storage.from('campus_storage').createSignedUrl(rutaArchivo, 60); if (data) window.open(data.signedUrl, '_blank'); else alert("Error al abrir el archivo."); };

  if (loading) return <div className="loading-container">Cargando Campus...</div>;

  return (
    <div className="prof-panel-container">
      <div className="prof-panel-wrapper">
        <button onClick={() => navigate(esDirector ? '/panel-director' : '/admin-academico')} className="btn-volver"><ArrowLeft size={20} /> {esDirector ? 'VOLVER AL PANEL DIRECTOR' : 'VOLVER AL DASHBOARD DOCENTE'}</button>

        <div className="prof-header-dark">
          <div>
            <p className="panel-gestion-text">PANEL DE GESTIÓN</p>
            <h1 className="materia-title">{materia?.nombre_materia}</h1>
            {fechaCierreActas && <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', color: notasBloqueadas ? '#fca5a5' : '#86efac', fontWeight: 'bold' }}>{notasBloqueadas ? `🔒 El ingreso de notas cerró el ${fechaCierreActas.toLocaleDateString()}` : `⏳ Tienes hasta el ${fechaCierreActas.toLocaleDateString()} para ingresar notas`}{esDirector && " (Acceso total: Modo Director)"}</p>}
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            {esDirector && <button onClick={() => navigate('/panel-director')} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 20px', borderRadius: '50px', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={18} /> EDITAR MÓDULO (DIRECTOR)</button>}
            {pestañaActiva === 'planificacion' && (
              <div className="modo-edicion-wrapper">
                <label className="modo-edicion-label"><input type="checkbox" checked={modoEdicion} onChange={() => setModoEdicion(!modoEdicion)} className="modo-edicion-checkbox"/> MODO EDICIÓN</label>
                {modoEdicion && <button onClick={() => { setEditandoId(null); setModalUnidad(true); }} className="btn-add-week"><Plus size={18} /> AÑADIR SEMANA</button>}
              </div>
            )}
          </div>
        </div>

        <div className="panel-tabs">
          <button onClick={() => setPestañaActiva('planificacion')} className={`btn-tab ${pestañaActiva === 'planificacion' ? 'active' : 'inactive'}`}>Planificación</button>
          <button onClick={() => setPestañaActiva('calificaciones')} className={`btn-tab ${pestañaActiva === 'calificaciones' ? 'active' : 'inactive'}`}>Gradebook</button>
          <button onClick={() => setPestañaActiva('categorias')} className={`btn-tab ${pestañaActiva === 'categorias' ? 'active' : 'inactive'}`}>Bolsas de Calificación</button>
          <button onClick={() => setPestañaActiva('asistencia')} className={`btn-tab ${pestañaActiva === 'asistencia' ? 'active' : 'inactive'}`}>Asistencia</button>
        </div>

        {/* --- PESTAÑA: ASISTENCIA --- */}
        {pestañaActiva === 'asistencia' && (
          <div className="gradebook-card" style={{ padding: '30px' }}>
            <h2 style={{ marginTop: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}><Calendar size={24} color="#0f6cbd" /> Control de Asistencia</h2>
            
            {/* PANEL DE BLOQUEO DE PESO */}
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ color: '#166534', display: 'block', marginBottom: '5px' }}>Valor de la Asistencia en la Nota Final</strong>
                <span style={{ fontSize: '0.85rem', color: '#15803d' }}>
                  {materia?.peso_asistencia > 0 
                    ? 'El peso de la asistencia ya fue establecido para este curso y está bloqueado.' 
                    : 'Define el porcentaje de la asistencia. ATENCIÓN: Una vez guardado, no se podrá modificar.'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {materia?.peso_asistencia > 0 ? (
                  <div style={{ backgroundColor: '#dcfce7', border: '2px solid #22c55e', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', color: '#166534', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    🔒 Fijado en {materia.peso_asistencia}%
                  </div>
                ) : (
                  <>
                    <input type="number" min="1" max="100" style={{ width: '80px', padding: '8px', border: '2px solid #22c55e', borderRadius: '6px', fontWeight: 'bold', textAlign: 'center' }} value={pesoAsistencia} onChange={(e) => setPesoAsistencia(e.target.value)} />
                    <span style={{ fontWeight: 'bold', color: '#166534' }}>%</span>
                    <button onClick={handleGuardarPesoAsistencia} style={{ backgroundColor: '#16a34a', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar Peso</button>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Seleccionar Fecha de Clase:</label>
                <input type="date" className="form-control" style={{ width: '250px' }} value={fechaAsistencia} onChange={(e) => setFechaAsistencia(e.target.value)} />
              </div>
              <button onClick={handleGuardarAsistencia} style={{ backgroundColor: '#0f6cbd', color: 'white', padding: '10px 25px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>💾 Guardar Asistencia</button>
            </div>

            <table className="grade-table">
              <thead><tr><th>ESTUDIANTE</th><th style={{ width: '30%' }}>ESTADO DE ASISTENCIA</th></tr></thead>
              <tbody>
                {alumnos.length === 0 ? ( <tr><td colSpan="2" style={{ textAlign: 'center', padding: '20px' }}>No hay estudiantes matriculados activos.</td></tr> ) : (
                  alumnos.map(alumno => {
                    const estadoActual = registrosAsistencia[alumno.id] || '';
                    let bgColor = 'transparent';
                    if (estadoActual === 'Presente') bgColor = '#dcfce7'; if (estadoActual === 'Ausente') bgColor = '#fee2e2'; if (estadoActual === 'Atraso') bgColor = '#fef3c7'; if (estadoActual === 'Justificado') bgColor = '#e0f2fe';
                    return (
                      <tr key={alumno.id} style={{ backgroundColor: bgColor }}>
                        <td><strong>{alumno.nombre_completo}</strong><br/><span className="estudiante-cedula" style={{ color: '#64748b', fontSize: '0.85rem' }}>C.I: {alumno.cedula}</span></td>
                        <td>
                          <select className="form-control" style={{ border: '2px solid #cbd5e1', fontWeight: 'bold' }} value={estadoActual} onChange={(e) => setRegistrosAsistencia({ ...registrosAsistencia, [alumno.id]: e.target.value })}>
                            <option value="">-- Sin marcar --</option><option value="Presente">Presente</option><option value="Ausente">Ausente</option><option value="Atraso">Atraso</option><option value="Justificado">Falta Justificada</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* --- PESTAÑA: PARÁMETROS DE CALIFICACIÓN --- */}
        {pestañaActiva === 'categorias' && (
          <div className="gradebook-card" style={{ padding: '30px' }}>
            <h2 style={{marginTop: 0, color: '#0f172a'}}>Parámetros de Evaluación</h2>
            <p style={{color: '#475569', marginBottom: '25px'}}>Crea las "Bolsas" donde se agruparán las calificaciones. La suma total (incluyendo Asistencia) debe ser el 100%.</p>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              <div style={{ flex: 1, backgroundColor: sumaPorcentajes === 100 ? '#f0fdf4' : '#fff1f2', border: `1px solid ${sumaPorcentajes === 100 ? '#bbf7d0' : '#fecdd3'}`, padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: sumaPorcentajes === 100 ? '#16a34a' : '#e11d48' }}>TOTAL ASIGNADO</p>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: sumaPorcentajes === 100 ? '#15803d' : '#be123c' }}>{sumaPorcentajes}%</div>
                <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>{sumaPorcentajes === 100 ? '✅ Configuración perfecta' : `⚠️ Faltan ${100 - sumaPorcentajes}% por asignar`}</p>
              </div>
              <div style={{ flex: 2, display: 'flex', alignItems: 'center' }}>
                <button onClick={() => setModalCategoria(true)} disabled={sumaPorcentajes >= 100} style={{ backgroundColor: sumaPorcentajes >= 100 ? '#cbd5e1' : '#0ea5e9', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: sumaPorcentajes >= 100 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}><Percent size={20} /> AGREGAR CATEGORÍA</button>
              </div>
            </div>

            <table className="grade-table">
              <thead><tr><th>NOMBRE DE LA CATEGORÍA</th><th>PESO (%)</th><th>ACCIONES</th></tr></thead>
              <tbody>
                {categorias.length === 0 && !materia?.peso_asistencia ? ( <tr><td colSpan="3" style={{textAlign: 'center', padding: '20px'}}>No hay parámetros creados.</td></tr> ) : (
                  <>
                    {materia?.peso_asistencia > 0 && (
                      <tr style={{ backgroundColor: '#f0fdf4' }}>
                        <td><strong>Asistencia al curso</strong> <span style={{fontSize: '0.8rem', color: '#16a34a'}}>(Automático)</span></td>
                        <td><span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '5px 10px', borderRadius: '6px', fontWeight: 'bold' }}>{materia.peso_asistencia}%</span></td>
                        <td><span style={{ color: '#64748b', fontSize: '0.85rem' }}>Bloqueado en pestaña Asistencia</span></td>
                      </tr>
                    )}
                    {categorias.map(cat => (
                      <tr key={cat.id}>
                        <td><strong>{cat.nombre}</strong></td>
                        <td><span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '5px 10px', borderRadius: '6px', fontWeight: 'bold' }}>{cat.porcentaje}%</span></td>
                        <td><button onClick={() => handleEliminarCategoria(cat.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><Trash2 size={16} /> Eliminar</button></td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* --- PESTAÑA: PLANIFICACIÓN --- */}
        {pestañaActiva === 'planificacion' && (
          <div className="campus-ug-layout">
            {unidades.length === 0 ? <div className="empty-state-text">No hay semanas creadas. Activa el Modo Edición y añade una.</div> : (
              unidades.map(unidad => (
                <div key={unidad.id} className="ug-unidad-card">
                  <div className="ug-unidad-header">
                    <h2>{unidad.titulo}</h2>
                    {modoEdicion && <div className="action-buttons-wrapper"><button onClick={() => abrirEdicionUnidad(unidad)} className="btn-icon-action"><Settings size={20} /></button><button onClick={() => handleEliminar('unidades', unidad.id)} className="btn-icon-danger"><Trash2 size={20} /></button></div>}
                  </div>
                  <div className="ug-seccion">
                    <h4 className="ug-seccion-title">RECURSOS</h4>
                    <div className="ug-lista-items">
                      {unidad.recursos.map(recurso => (
                        <div key={recurso.id} className="ug-item item-flex-between">
                          <div className="recurso-inner-flex"><LinkIcon size={18} color="#0284c7" /><a href={recurso.url} target="_blank" rel="noreferrer" className="ug-link">{recurso.titulo}</a></div>
                          {modoEdicion && <div className="action-buttons-wrapper"><button onClick={() => abrirEdicionRecurso(recurso, unidad.id)} className="btn-icon-action"><Edit2 size={16} /></button><button onClick={() => handleEliminar('recursos', recurso.id)} className="btn-icon-danger"><Trash2 size={16} /></button></div>}
                        </div>
                      ))}
                      {modoEdicion && <button onClick={() => { setUnidadActivaId(unidad.id); setEditandoId(null); setModalRecurso(true); }} className="ug-btn-añadir">+ Añadir un recurso</button>}
                    </div>
                  </div>
                  <div className="ug-seccion">
                    <h4 className="ug-seccion-title">ACTIVIDADES Y EVALUACIÓN</h4>
                    <div className="ug-lista-items">
                      {unidad.actividades.map(actividad => {
                        const categoriaAsignada = categorias.find(c => c.id === actividad.categoria_id);
                        return (
                          <div key={actividad.id} className="ug-item-actividad item-flex-between">
                            <div className="actividad-inner-flex">
                              <div className="actividad-icon-wrapper">{getIconoActividad(actividad.tipo)}</div>
                              <div>
                                <div className="armar-examen-wrapper"><span className="ug-link">{actividad.titulo}</span>{actividad.tipo === 'examen' && <button onClick={() => navigate(`/editor-examen/${actividad.id}`)} className="btn-armar-examen">⚙️ Armar Examen</button>}</div>
                                <div className="ug-fechas">{categoriaAsignada && <span style={{backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#475569', marginRight: '10px'}}>Bolsa: {categoriaAsignada.nombre}</span>}{actividad.apertura && <span>Apertura: {new Date(actividad.apertura).toLocaleString()}</span>}{actividad.cierre && <span className="fecha-margin">Cierre: {new Date(actividad.cierre).toLocaleString()}</span>}</div>
                                {!actividad.visible && <div className="badge-margin"><span className="ug-badge-oculto"><EyeOff size={14}/> Oculto a estudiantes</span></div>}
                              </div>
                            </div>
                            {modoEdicion && <div className="action-buttons-wrapper"><button onClick={() => abrirEdicionActividad(actividad, unidad.id)} className="btn-icon-action"><Edit2 size={16} /></button><button onClick={() => handleEliminar('actividades', actividad.id)} className="btn-icon-danger"><Trash2 size={16} /></button></div>}
                          </div>
                        );
                      })}
                      {modoEdicion && <button onClick={() => { setUnidadActivaId(unidad.id); setEditandoId(null); setModalActividad(true); }} className="ug-btn-añadir">+ Añadir una actividad</button>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- PESTAÑA: CALIFICACIONES (GRADEBOOK) --- */}
        {pestañaActiva === 'calificaciones' && (
          <div className="gradebook-card">
            <div className="calificando-header">
              <label className="calificando-label">Calificando la actividad:</label>
              <select className="form-control calificando-select" value={actividadSeleccionadaId} onChange={(e) => setActividadSeleccionadaId(e.target.value)}>
                <option value="">Selecciona una actividad...</option>
                {unidades.flatMap(u => u.actividades).filter(a => a.tipo === 'tarea' || a.tipo === 'foro').map(a => (
                  <option key={a.id} value={a.id}>{a.tipo === 'foro' ? 'FORO' : 'TAREA'} - {a.titulo}</option>
                ))}
              </select>
            </div>
            <div className="grade-table-wrapper">
                <table className="grade-table">
                  <thead><tr><th>ESTUDIANTE</th><th>ESTADO DE ENTREGA</th><th>ARCHIVO / APORTE</th><th>CALIFICACIÓN (/100)</th><th style={{ backgroundColor: '#0f172a', color: '#38bdf8' }}>PROMEDIO ACUMULADO</th></tr></thead>
                  <tbody>
                    {alumnos.map(alumno => {
                      if (!alumno) return null;
                      const entrega = entregas.find(e => e.estudiante_id === alumno.id && e.tarea_id === actividadSeleccionadaId);
                      const actividadActual = unidades.flatMap(u => u.actividades).find(a => a.id === actividadSeleccionadaId);
                      const esForo = actividadActual?.tipo === 'foro';
                      const fechaCierre = actividadActual?.cierre ? new Date(actividadActual.cierre) : null;
                      let esAtrasado = false;
                      if (fechaCierre) esAtrasado = (entrega && entrega.entregado_en) ? new Date(entrega.entregado_en) > fechaCierre : new Date() > fechaCierre;

                      return (
                        <tr key={alumno.id}>
                          <td><strong>{alumno.nombre_completo}</strong><br/><span className="estudiante-cedula">C.I: {alumno.cedula}</span></td>
                          <td><div className="estado-wrapper">{entrega?.calificacion ? <span className="estado-calificado">Calificado</span> : entrega || esForo ? <span className="estado-pendiente">Pendiente</span> : <span className="estado-no-entregado">No Entregado</span>}{esAtrasado && <span className="estado-atrasado">⚠️ ATRASADO</span>}</div></td>
                          <td>{esForo ? <button onClick={() => navigate(`/foro/${actividadSeleccionadaId}`)} className="btn-view-pdf btn-ver-foro">🗣️ Ver Foro</button> : entrega?.archivo_url ? <button onClick={() => handleVerPDF(entrega.archivo_url)} className="btn-view-pdf">📄 Ver PDF</button> : <span className="sin-archivo-text">Sin archivo</span>}</td>
                          <td>
                            {editandoNotaId === alumno.id ? (
                              <div className="grade-edit-wrapper">
                                <div className="grade-input-group">
                                  <input type="number" className="grade-input" placeholder={entrega?.calificacion || "0"} value={notasTemporales[alumno.id] !== undefined ? notasTemporales[alumno.id] : ''} onChange={(e) => setNotasTemporales({...notasTemporales, [alumno.id]: e.target.value})} />
                                  <button onClick={async () => {
                                    if (!notasTemporales[alumno.id]) return; 
                                    const { error } = await supabase.from('entregas_tareas').upsert({ tarea_id: actividadSeleccionadaId, estudiante_id: alumno.id, calificacion: notasTemporales[alumno.id], comentario_profesor: !esForo ? (comentariosTemporales[alumno.id] || '') : '', calificado_en: new Date().toISOString(), archivo_url: entrega?.archivo_url || 'Calificación directa - Sin entrega' }, { onConflict: 'tarea_id, estudiante_id' });
                                    if (!error) { alert("¡Nota guardada!"); setEditandoNotaId(null); cargarDatos(); }
                                  }} className="btn-guardar-nota">Guardar</button>
                                  <button onClick={() => setEditandoNotaId(null)} className="btn-cerrar-nota">X</button>
                                </div>
                                {!esForo && <textarea placeholder="Retroalimentación (opcional)..." className="textarea-comentario" rows="2" value={comentariosTemporales[alumno.id] !== undefined ? comentariosTemporales[alumno.id] : ''} onChange={(e) => setComentariosTemporales({...comentariosTemporales, [alumno.id]: e.target.value})} />}
                              </div>
                            ) : (
                              <div className="nota-display-wrapper">
                                <div className="nota-display-inner"><span className={`nota-valor ${entrega?.calificacion != null ? 'nota-valor-has' : 'nota-valor-empty'}`}>{entrega?.calificacion != null ? `${entrega.calificacion} / 100` : '- / 100'}</span>{notasBloqueadas ? <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>🔒 Actas Cerradas</span> : <button onClick={() => { setNotasTemporales({...notasTemporales, [alumno.id]: entrega?.calificacion || ''}); if (!esForo) setComentariosTemporales({...comentariosTemporales, [alumno.id]: entrega?.comentario_profesor || ''}); setEditandoNotaId(alumno.id); }} className="btn-editar-nota">✏️ {entrega?.calificacion != null ? 'Editar' : 'Calificar'}</button>}</div>
                                {!esForo && entrega?.comentario_profesor && <div className="comentario-display">💬 {entrega.comentario_profesor}</div>}
                              </div>
                            )}
                          </td>
                          <td style={{ backgroundColor: '#f8fafc', borderLeft: '2px solid #e2e8f0', textAlign: 'center', verticalAlign: 'middle' }}>
                            <div style={{ display: 'inline-block', backgroundColor: '#0f172a', color: '#38bdf8', padding: '8px 15px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '900', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>{calcularPromedioAcumulado(alumno.id)}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
          </div>
        )}
      </div>

      {/* --- MODALES OMITIDOS POR BREVEDAD - SON LOS MISMOS --- */}
      {modalCategoria && ( <div className="modal-overlay"><div className="modal-content"><h2>Añadir Parámetro</h2><form onSubmit={handleGuardarCategoria}><div className="form-group"><label>Nombre</label><input required className="form-control" value={formCategoria.nombre} onChange={e => setFormCategoria({...formCategoria, nombre: e.target.value})} /></div><div className="form-group"><label>Porcentaje (%) - Disponible: {100 - sumaPorcentajes}%</label><input type="number" min="1" max={100 - sumaPorcentajes} required className="form-control" value={formCategoria.porcentaje} onChange={e => setFormCategoria({...formCategoria, porcentaje: e.target.value})} /></div><div className="modal-actions"><button type="button" className="btn-secondary" onClick={cerrarModales}>Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div></form></div></div> )}
      {modalUnidad && ( <div className="modal-overlay"><div className="modal-content"><h2>{editandoId ? 'Editar' : 'Añadir'} Semana/Unidad</h2><form onSubmit={handleGuardarUnidad}><div className="form-group"><label>Título</label><input required className="form-control" value={formUnidad.titulo} onChange={e => setFormUnidad({...formUnidad, titulo: e.target.value})} /></div><div className="form-group"><label>Orden</label><input type="number" required className="form-control" value={formUnidad.orden} onChange={e => setFormUnidad({...formUnidad, orden: e.target.value})} /></div><div className="modal-actions"><button type="button" className="btn-secondary" onClick={cerrarModales}>Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div></form></div></div> )}
      {modalRecurso && ( <div className="modal-overlay"><div className="modal-content"><h2>{editandoId ? 'Editar' : 'Añadir'} Recurso</h2><form onSubmit={handleGuardarRecurso}><div className="form-group"><label>Título</label><input required className="form-control" value={formRecurso.titulo} onChange={e => setFormRecurso({...formRecurso, titulo: e.target.value})} /></div><div className="form-group"><label>URL</label><input required className="form-control" value={formRecurso.url} onChange={e => setFormRecurso({...formRecurso, url: e.target.value})} /></div><div className="form-group"><label>Tipo</label><select className="form-control" value={formRecurso.tipo} onChange={e => setFormRecurso({...formRecurso, tipo: e.target.value})}><option value="link">Enlace Web</option><option value="pdf">Documento PDF</option><option value="video">Video</option></select></div><div className="modal-actions"><button type="button" className="btn-secondary" onClick={cerrarModales}>Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div></form></div></div> )}
      {modalActividad && ( <div className="modal-overlay"><div className="modal-content"><h2>{editandoId ? 'Editar' : 'Añadir'} Actividad</h2><form onSubmit={handleGuardarActividad}><div className="form-group"><label>Título</label><input required className="form-control" value={formActividad.titulo} onChange={e => setFormActividad({...formActividad, titulo: e.target.value})} /></div><div className="form-group"><label>Descripción</label><textarea rows="3" className="form-control" value={formActividad.descripcion} onChange={e => setFormActividad({...formActividad, descripcion: e.target.value})} /></div><div className="form-group"><label>Bolsa de calificación</label><select required className="form-control" value={formActividad.categoria_id} onChange={e => setFormActividad({...formActividad, categoria_id: e.target.value})}><option value="">Selecciona una categoría...</option>{categorias.map(cat => ( <option key={cat.id} value={cat.id}>{cat.nombre} (Vale el {cat.porcentaje}%)</option> ))}</select></div><div className="form-group"><label>Tipo</label><select className="form-control" value={formActividad.tipo} onChange={e => setFormActividad({...formActividad, tipo: e.target.value})}><option value="tarea">Subida de Tarea</option><option value="foro">Foro</option><option value="examen">Examen</option></select></div><div className="modal-grid"><div className="form-group"><label>Apertura</label><input type="datetime-local" className="form-control" value={formActividad.apertura} onChange={e => setFormActividad({...formActividad, apertura: e.target.value})} /></div><div className="form-group"><label>Cierre</label><input type="datetime-local" className="form-control" value={formActividad.cierre} onChange={e => setFormActividad({...formActividad, cierre: e.target.value})} /></div></div><div className="modal-actions"><button type="button" className="btn-secondary" onClick={cerrarModales}>Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div></form></div></div> )}

    </div>
  );
};

export default PanelClaseProfesor;                    