import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Plus, Edit2, Trash2, Link as LinkIcon, FileText, CheckSquare, MessageCircle, EyeOff, Settings, Percent } from 'lucide-react';
import { useGestionContenido } from '../hooks/useGestionContenido';
import './PanelClaseProfesor.css';

const PanelClaseProfesor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { obtenerEstructuraMateria, guardarElemento, actualizarElemento, eliminarElemento } = useGestionContenido();
  
  const [loading, setLoading] = useState(true);
  const [pestañaActiva, setPestañaActiva] = useState('planificacion');
  const [modoEdicion, setModoEdicion] = useState(false);
  
  const [materia, setMateria] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  
  // NUEVO: Estados para Categorías (El 30/30/40)
  const [categorias, setCategorias] = useState([]);
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

  // ACTUALIZADO: formActividad ahora incluye categoria_id
  const [modalActividad, setModalActividad] = useState(false);
  const [formActividad, setFormActividad] = useState({ 
    titulo: '', descripcion: '', tipo: 'tarea', apertura: '', cierre: '', visible: true, permite_atrasos: true, categoria_id: '' 
  });

  const cargarDatos = async () => {
    setLoading(true);
    
    const { data: matData } = await supabase.from('materias').select('id, nombre_materia, nivel_id, fecha_cierre_notas').eq('id', id).single();
    if (matData) setMateria(matData);

    // NUEVO: Cargar las categorías de esta materia
    const { data: catData } = await supabase.from('categorias_notas').select('*').eq('materia_id', id);
    if (catData) setCategorias(catData);

    try {
      const estructura = await obtenerEstructuraMateria(id);
      setUnidades(estructura || []);
      if (estructura && estructura.length > 0) {
         const primeraActividad = estructura.flatMap(u => u.actividades).find(a => a.tipo === 'tarea');
         if (primeraActividad) setActividadSeleccionadaId(primeraActividad.id);
      }
    } catch (err) {
      console.error(err);
    }

    if (matData?.nivel_id) {
      const { data: matriculasData } = await supabase.from('matriculas').select('estudiante:perfiles(id, nombre_completo, cedula)').eq('nivel_id', matData.nivel_id).eq('estado', 'activo');
      if (matriculasData) setAlumnos(matriculasData.map(m => m.estudiante));
    }

    const { data: entregasData } = await supabase.from('entregas_tareas').select('*');
    if (entregasData) setEntregas(entregasData);

    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  useEffect(() => {
    setNotasTemporales({});
    setComentariosTemporales({});
    setEditandoNotaId(null);
  }, [actividadSeleccionadaId]);

  const fechaCierreActas = materia?.fecha_cierre_notas ? new Date(materia.fecha_cierre_notas) : null;
  const notasBloqueadas = fechaCierreActas ? new Date() > fechaCierreActas : false;
// --- CEREBRO MATEMÁTICO: PROMEDIO PONDERADO ---
  const calcularPromedioAcumulado = (alumnoId) => {
    if (categorias.length === 0) return "0.00";

    let notaFinal = 0;

    // 1. Recorremos cada bolsa (ej: Deberes 30%, Examen 40%)
    categorias.forEach(cat => {
      const actividadesCat = unidades.flatMap(u => u.actividades).filter(a => a.categoria_id == cat.id);
      if (actividadesCat.length === 0) return; 

      let sumaNotasCat = 0;
      let tareasCalificadas = 0;

      // 2. Buscamos las notas del alumno en esta bolsa específica
      actividadesCat.forEach(act => {
        const entrega = entregas.find(e => e.estudiante_id === alumnoId && e.tarea_id === act.id);
        if (entrega && entrega.calificacion != null) {
          sumaNotasCat += Number(entrega.calificacion);
          tareasCalificadas++;
        }
      });

      // 3. Calculamos el promedio de la bolsa y lo multiplicamos por su peso
      if (tareasCalificadas > 0) {
        const promedioCat = sumaNotasCat / tareasCalificadas;
        const aporteAlFinal = promedioCat * (Number(cat.porcentaje) / 100);
        notaFinal += aporteAlFinal;
      }
    });

    return notaFinal.toFixed(2);
  };
  // NUEVO: Matemáticas para el límite del 100%
  const sumaPorcentajes = categorias.reduce((acc, cat) => acc + Number(cat.porcentaje), 0);

  const handleGuardarCategoria = async (e) => {
    e.preventDefault();
    const nuevoPorc = Number(formCategoria.porcentaje);
    
    if (sumaPorcentajes + nuevoPorc > 100) {
      alert(`¡Alto ahí! La suma total superaría el 100%. Te queda un ${100 - sumaPorcentajes}% disponible.`);
      return;
    }

    const { error } = await supabase.from('categorias_notas').insert([{
      materia_id: id,
      nombre: formCategoria.nombre,
      porcentaje: nuevoPorc
    }]);

    if (!error) {
      setModalCategoria(false);
      setFormCategoria({ nombre: '', porcentaje: '' });
      cargarDatos();
    } else {
      alert("Error al guardar la categoría.");
    }
  };

  const handleEliminarCategoria = async (catId) => {
    if (window.confirm('¿Seguro que deseas eliminar esta categoría? Las actividades vinculadas se quedarán sin asignar.')) {
      await supabase.from('categorias_notas').delete().eq('id', catId);
      cargarDatos();
    }
  };

  const handleEliminar = async (tabla, itemId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esto? Esta acción no se puede deshacer.')) {
      try {
        await eliminarElemento(tabla, itemId);
        cargarDatos();
      } catch (err) {
        alert("Error al eliminar el elemento.");
      }
    }
  };

  const abrirEdicionUnidad = (unidad) => {
    setEditandoId(unidad.id);
    setFormUnidad({ titulo: unidad.titulo, orden: unidad.orden });
    setModalUnidad(true);
  };

  const abrirEdicionRecurso = (recurso, unidadId) => {
    setEditandoId(recurso.id);
    setUnidadActivaId(unidadId);
    setFormRecurso({ titulo: recurso.titulo, url: recurso.url, tipo: recurso.tipo });
    setModalRecurso(true);
  };

  const abrirEdicionActividad = (actividad, unidadId) => {
    setEditandoId(actividad.id);
    setUnidadActivaId(unidadId);
    setFormActividad({ 
      titulo: actividad.titulo, 
      descripcion: actividad.descripcion || '', 
      tipo: actividad.tipo, 
      apertura: actividad.apertura ? actividad.apertura.slice(0, 16) : '', 
      cierre: actividad.cierre ? actividad.cierre.slice(0, 16) : '', 
      visible: actividad.visible,
      permite_atrasos: actividad.permite_atrasos !== undefined ? actividad.permite_atrasos : true,
      categoria_id: actividad.categoria_id || '' 
    });
    setModalActividad(true);
  };

  const handleGuardarUnidad = async (e) => {
    e.preventDefault();
    if (editandoId) {
      await actualizarElemento('unidades', editandoId, { titulo: formUnidad.titulo, orden: formUnidad.orden });
    } else {
      await guardarElemento('unidades', { materia_id: id, titulo: formUnidad.titulo, orden: formUnidad.orden });
    }
    cerrarModales();
    cargarDatos();
  };

  const handleGuardarRecurso = async (e) => {
    e.preventDefault();
    if (editandoId) {
      await actualizarElemento('recursos', editandoId, { titulo: formRecurso.titulo, url: formRecurso.url, tipo: formRecurso.tipo });
    } else {
      await guardarElemento('recursos', { unidad_id: unidadActivaId, titulo: formRecurso.titulo, url: formRecurso.url, tipo: formRecurso.tipo });
    }
    cerrarModales();
    cargarDatos();
  };

  const handleGuardarActividad = async (e) => {
    e.preventDefault();
    if (!formActividad.categoria_id && categorias.length > 0) {
      alert("Por favor, selecciona a qué categoría de notas pertenece esta actividad.");
      return;
    }

    const datos = { 
      titulo: formActividad.titulo, 
      descripcion: formActividad.descripcion, 
      tipo: formActividad.tipo, 
      apertura: formActividad.apertura || null, 
      cierre: formActividad.cierre || null, 
      visible: formActividad.visible === 'true' || formActividad.visible === true,
      permite_atrasos: formActividad.permite_atrasos === 'true' || formActividad.permite_atrasos === true,
      categoria_id: formActividad.categoria_id || null
    };

    if (editandoId) {
      await actualizarElemento('actividades', editandoId, datos);
    } else {
      await guardarElemento('actividades', { unidad_id: unidadActivaId, ...datos });
    }
    cerrarModales();
    cargarDatos();
  };

  const cerrarModales = () => {
    setModalUnidad(false);
    setModalRecurso(false);
    setModalActividad(false);
    setModalCategoria(false);
    setEditandoId(null);
    setFormUnidad({ titulo: '', orden: 1 });
    setFormRecurso({ titulo: '', url: '', tipo: 'link' });
    setFormActividad({ titulo: '', descripcion: '', tipo: 'tarea', apertura: '', cierre: '', visible: true, permite_atrasos: true, categoria_id: '' });
  };

  const getIconoActividad = (tipo) => {
    if (tipo === 'tarea') return <FileText size={18} color="#e11d48" />;
    if (tipo === 'examen') return <CheckSquare size={18} color="#0284c7" />;
    if (tipo === 'foro') return <MessageCircle size={18} color="#16a34a" />;
    return <FileText size={18} />;
  };

  const handleVerPDF = async (rutaArchivo) => {
    const { data } = await supabase.storage.from('campus_storage').createSignedUrl(rutaArchivo, 60);
    if (data) window.open(data.signedUrl, '_blank');
    else alert("Error al abrir el archivo.");
  };

  if (loading) return <div className="loading-container">Cargando Campus...</div>;

  return (
    <div className="prof-panel-container">
      <div className="prof-panel-wrapper">
        
        <button onClick={() => navigate('/admin-academico')} className="btn-volver">
          <ArrowLeft size={20} /> VOLVER AL DASHBOARD DOCENTE
        </button>

        <div className="prof-header-dark">
          <div>
            <p className="panel-gestion-text">PANEL DE GESTIÓN</p>
            <h1 className="materia-title">{materia?.nombre_materia}</h1>
            {fechaCierreActas && (
              <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', color: notasBloqueadas ? '#fca5a5' : '#86efac', fontWeight: 'bold' }}>
                {notasBloqueadas 
                  ? `🔒 El ingreso de notas cerró el ${fechaCierreActas.toLocaleDateString()}`
                  : `⏳ Tienes hasta el ${fechaCierreActas.toLocaleDateString()} para ingresar notas`}
              </p>
            )}
          </div>
          
          {pestañaActiva === 'planificacion' && (
            <div className="modo-edicion-wrapper">
              <label className="modo-edicion-label">
                <input type="checkbox" checked={modoEdicion} onChange={() => setModoEdicion(!modoEdicion)} className="modo-edicion-checkbox"/>
                MODO EDICIÓN
              </label>
              
              {modoEdicion && (
                <button onClick={() => { setEditandoId(null); setModalUnidad(true); }} className="btn-add-week">
                  <Plus size={18} /> AÑADIR SEMANA
                </button>
              )}
            </div>
          )}
        </div>

        <div className="panel-tabs">
          <button onClick={() => setPestañaActiva('planificacion')} className={`btn-tab ${pestañaActiva === 'planificacion' ? 'active' : 'inactive'}`}>Planificación de Semanas</button>
          <button onClick={() => setPestañaActiva('calificaciones')} className={`btn-tab ${pestañaActiva === 'calificaciones' ? 'active' : 'inactive'}`}>Gradebook</button>
          <button onClick={() => setPestañaActiva('categorias')} className={`btn-tab ${pestañaActiva === 'categorias' ? 'active' : 'inactive'}`}>Parámetros de Calificación</button>
        </div>

        {/* --- PESTAÑA: PARÁMETROS DE CALIFICACIÓN --- */}
        {pestañaActiva === 'categorias' && (
          <div className="gradebook-card" style={{ padding: '30px' }}>
            <h2 style={{marginTop: 0, color: '#0f172a'}}>Parámetros de Evaluación</h2>
            <p style={{color: '#475569', marginBottom: '25px'}}>Crea las "Bolsas" donde se agruparán las calificaciones. La suma total debe ser obligatoriamente el 100%.</p>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              <div style={{ flex: 1, backgroundColor: sumaPorcentajes === 100 ? '#f0fdf4' : '#fff1f2', border: `1px solid ${sumaPorcentajes === 100 ? '#bbf7d0' : '#fecdd3'}`, padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: sumaPorcentajes === 100 ? '#16a34a' : '#e11d48' }}>TOTAL ASIGNADO</p>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: sumaPorcentajes === 100 ? '#15803d' : '#be123c' }}>
                  {sumaPorcentajes}%
                </div>
                <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  {sumaPorcentajes === 100 ? '✅ Configuración perfecta' : `⚠️ Faltan ${100 - sumaPorcentajes}% por asignar`}
                </p>
              </div>
              
              <div style={{ flex: 2, display: 'flex', alignItems: 'center' }}>
                <button 
                  onClick={() => setModalCategoria(true)} 
                  disabled={sumaPorcentajes >= 100}
                  style={{ backgroundColor: sumaPorcentajes >= 100 ? '#cbd5e1' : '#0ea5e9', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: sumaPorcentajes >= 100 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Percent size={20} /> AGREGAR CATEGORÍA
                </button>
              </div>
            </div>

            <table className="grade-table">
              <thead>
                <tr>
                  <th>NOMBRE DE LA CATEGORÍA</th>
                  <th>PESO (%)</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {categorias.length === 0 ? (
                  <tr><td colSpan="3" style={{textAlign: 'center', padding: '20px'}}>No hay categorías creadas.</td></tr>
                ) : (
                  categorias.map(cat => (
                    <tr key={cat.id}>
                      <td><strong>{cat.nombre}</strong></td>
                      <td><span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '5px 10px', borderRadius: '6px', fontWeight: 'bold' }}>{cat.porcentaje}%</span></td>
                      <td>
                        <button onClick={() => handleEliminarCategoria(cat.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Trash2 size={16} /> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* --- PESTAÑA: PLANIFICACIÓN (SIN CAMBIOS ESTRUCTURALES) --- */}
        {pestañaActiva === 'planificacion' && (
          <div className="campus-ug-layout">
            {unidades.length === 0 ? (
              <div className="empty-state-text">No hay semanas creadas. Activa el Modo Edición y añade una.</div>
            ) : (
              unidades.map(unidad => (
                <div key={unidad.id} className="ug-unidad-card">
                  <div className="ug-unidad-header">
                    <h2>{unidad.titulo}</h2>
                    {modoEdicion && (
                      <div className="action-buttons-wrapper">
                        <button onClick={() => abrirEdicionUnidad(unidad)} className="btn-icon-action"><Settings size={20} /></button>
                        <button onClick={() => handleEliminar('unidades', unidad.id)} className="btn-icon-danger"><Trash2 size={20} /></button>
                      </div>
                    )}
                  </div>

                  <div className="ug-seccion">
                    <h4 className="ug-seccion-title">RECURSOS</h4>
                    <div className="ug-lista-items">
                      {unidad.recursos.map(recurso => (
                        <div key={recurso.id} className="ug-item item-flex-between">
                          <div className="recurso-inner-flex">
                            <LinkIcon size={18} color="#0284c7" />
                            <a href={recurso.url} target="_blank" rel="noreferrer" className="ug-link">{recurso.titulo}</a>
                          </div>
                          {modoEdicion && (
                            <div className="action-buttons-wrapper">
                              <button onClick={() => abrirEdicionRecurso(recurso, unidad.id)} className="btn-icon-action"><Edit2 size={16} /></button>
                              <button onClick={() => handleEliminar('recursos', recurso.id)} className="btn-icon-danger"><Trash2 size={16} /></button>
                            </div>
                          )}
                        </div>
                      ))}
                      {modoEdicion && (
                        <button onClick={() => { setUnidadActivaId(unidad.id); setEditandoId(null); setModalRecurso(true); }} className="ug-btn-añadir">
                          + Añadir un recurso
                        </button>
                      )}
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
                                <div className="armar-examen-wrapper">
                                  <span className="ug-link">{actividad.titulo}</span>
                                  {actividad.tipo === 'examen' && (
                                    <button onClick={() => navigate(`/editor-examen/${actividad.id}`)} className="btn-armar-examen">⚙️ Armar Examen</button>
                                  )}
                                </div>
                                <div className="ug-fechas">
                                  {categoriaAsignada && <span style={{backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#475569', marginRight: '10px'}}>Bolsa: {categoriaAsignada.nombre}</span>}
                                  {actividad.apertura && <span>Apertura: {new Date(actividad.apertura).toLocaleString()}</span>}
                                  {actividad.cierre && <span className="fecha-margin">Cierre: {new Date(actividad.cierre).toLocaleString()}</span>}
                                </div>
                                {!actividad.visible && <div className="badge-margin"><span className="ug-badge-oculto"><EyeOff size={14}/> Oculto a estudiantes</span></div>}
                              </div>
                            </div>
                            {modoEdicion && (
                              <div className="action-buttons-wrapper">
                                <button onClick={() => abrirEdicionActividad(actividad, unidad.id)} className="btn-icon-action"><Edit2 size={16} /></button>
                                <button onClick={() => handleEliminar('actividades', actividad.id)} className="btn-icon-danger"><Trash2 size={16} /></button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {modoEdicion && (
                        <button onClick={() => { setUnidadActivaId(unidad.id); setEditandoId(null); setModalActividad(true); }} className="ug-btn-añadir">
                          + Añadir una actividad
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- PESTAÑA: CALIFICACIONES (GRADEBOOK ACTUAL) --- */}
 {/* --- PESTAÑA: CALIFICACIONES (GRADEBOOK ACTUALIZADO) --- */}
        {pestañaActiva === 'calificaciones' && (
          <div className="gradebook-card">
            
            <div className="calificando-header">
              <label className="calificando-label">Calificando la actividad:</label>
              <select className="form-control calificando-select" value={actividadSeleccionadaId} onChange={(e) => setActividadSeleccionadaId(e.target.value)}>
                <option value="">Selecciona una actividad...</option>
                {unidades.flatMap(u => u.actividades).filter(a => a.tipo === 'tarea' || a.tipo === 'foro').map(a => (
                  <option key={a.id} value={a.id}>
                    {a.tipo === 'foro' ? 'FORO' : 'TAREA'} - {a.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="grade-table-wrapper">
                <table className="grade-table">
                  <thead>
                    <tr>
                      <th>ESTUDIANTE</th>
                      <th>ESTADO DE ENTREGA</th>
                      <th>ARCHIVO / APORTE</th>
                      <th>CALIFICACIÓN (/100)</th>
                      <th style={{ backgroundColor: '#0f172a', color: '#38bdf8' }}>PROMEDIO ACUMULADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumnos.map(alumno => {
                      if (!alumno) return null;
                      const entrega = entregas.find(e => e.estudiante_id === alumno.id && e.tarea_id === actividadSeleccionadaId);
                      const actividadActual = unidades.flatMap(u => u.actividades).find(a => a.id === actividadSeleccionadaId);
                      
                      const esForo = actividadActual?.tipo === 'foro';
                      const fechaCierre = actividadActual?.cierre ? new Date(actividadActual.cierre) : null;
                      
                      let esAtrasado = false;
                      if (fechaCierre) {
                        esAtrasado = (entrega && entrega.entregado_en) ? new Date(entrega.entregado_en) > fechaCierre : new Date() > fechaCierre;
                      }

                      return (
                        <tr key={alumno.id}>
                          <td>
                            <strong>{alumno.nombre_completo}</strong><br/>
                            <span className="estudiante-cedula">C.I: {alumno.cedula}</span>
                          </td>
                          <td>
                            <div className="estado-wrapper">
                              {entrega?.calificacion ? <span className="estado-calificado">Calificado</span> : entrega || esForo ? <span className="estado-pendiente">Pendiente</span> : <span className="estado-no-entregado">No Entregado</span>}
                              {esAtrasado && <span className="estado-atrasado">⚠️ ATRASADO</span>}
                            </div>
                          </td>
                          <td>
                            {esForo ? (
                              <button onClick={() => navigate(`/foro/${actividadSeleccionadaId}`)} className="btn-view-pdf btn-ver-foro">🗣️ Ver Foro</button>
                            ) : entrega?.archivo_url ? (
                              <button onClick={() => handleVerPDF(entrega.archivo_url)} className="btn-view-pdf">📄 Ver PDF</button>
                            ) : <span className="sin-archivo-text">Sin archivo</span>}
                          </td>
                          <td>
                            {editandoNotaId === alumno.id ? (
                              <div className="grade-edit-wrapper">
                                <div className="grade-input-group">
                                  <input type="number" className="grade-input" placeholder={entrega?.calificacion || "0"} value={notasTemporales[alumno.id] !== undefined ? notasTemporales[alumno.id] : ''} onChange={(e) => setNotasTemporales({...notasTemporales, [alumno.id]: e.target.value})} />
                                  <button onClick={async () => {
                                    if (!notasTemporales[alumno.id]) return; 
                                    const { error } = await supabase.from('entregas_tareas').upsert({
                                      tarea_id: actividadSeleccionadaId, estudiante_id: alumno.id, calificacion: notasTemporales[alumno.id],
                                      comentario_profesor: !esForo ? (comentariosTemporales[alumno.id] || '') : '', calificado_en: new Date().toISOString(), archivo_url: entrega?.archivo_url || 'Calificación directa - Sin entrega'
                                    }, { onConflict: 'tarea_id, estudiante_id' });
                                    if (!error) { alert("¡Nota guardada!"); setEditandoNotaId(null); cargarDatos(); }
                                  }} className="btn-guardar-nota">Guardar</button>
                                  <button onClick={() => setEditandoNotaId(null)} className="btn-cerrar-nota">X</button>
                                </div>
                                {!esForo && <textarea placeholder="Retroalimentación (opcional)..." className="textarea-comentario" rows="2" value={comentariosTemporales[alumno.id] !== undefined ? comentariosTemporales[alumno.id] : ''} onChange={(e) => setComentariosTemporales({...comentariosTemporales, [alumno.id]: e.target.value})} />}
                              </div>
                            ) : (
                              <div className="nota-display-wrapper">
                                <div className="nota-display-inner">
                                  <span className={`nota-valor ${entrega?.calificacion != null ? 'nota-valor-has' : 'nota-valor-empty'}`}>
                                    {entrega?.calificacion != null ? `${entrega.calificacion} / 100` : '- / 100'}
                                  </span>
                                  {notasBloqueadas ? (
                                    <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>🔒 Actas Cerradas</span>
                                  ) : (
                                    <button onClick={() => {
                                      setNotasTemporales({...notasTemporales, [alumno.id]: entrega?.calificacion || ''});
                                      if (!esForo) setComentariosTemporales({...comentariosTemporales, [alumno.id]: entrega?.comentario_profesor || ''});
                                      setEditandoNotaId(alumno.id);
                                    }} className="btn-editar-nota">✏️ {entrega?.calificacion != null ? 'Editar' : 'Calificar'}</button>
                                  )}
                                </div>
                                {!esForo && entrega?.comentario_profesor && <div className="comentario-display">💬 {entrega.comentario_profesor}</div>}
                              </div>
                            )}
                          </td>
                          {/* 👇 LA NUEVA COLUMNA CON EL PROMEDIO CALCULADO MÁGICAMENTE 👇 */}
                          <td style={{ backgroundColor: '#f8fafc', borderLeft: '2px solid #e2e8f0', textAlign: 'center', verticalAlign: 'middle' }}>
                            <div style={{ display: 'inline-block', backgroundColor: '#0f172a', color: '#38bdf8', padding: '8px 15px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '900', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                              {calcularPromedioAcumulado(alumno.id)}
                            </div>
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

      {/* --- MODALES --- */}
      
      {/* Modal Categoría */}
      {modalCategoria && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Añadir Parámetro (Bolsa de Notas)</h2>
            <form onSubmit={handleGuardarCategoria}>
              <div className="form-group"><label>Nombre (Ej: Examen Final)</label><input required className="form-control" value={formCategoria.nombre} onChange={e => setFormCategoria({...formCategoria, nombre: e.target.value})} /></div>
              <div className="form-group">
                <label>Porcentaje (%) - Disponible: {100 - sumaPorcentajes}%</label>
                <input type="number" min="1" max={100 - sumaPorcentajes} required className="form-control" value={formCategoria.porcentaje} onChange={e => setFormCategoria({...formCategoria, porcentaje: e.target.value})} />
              </div>
              <div className="modal-actions"><button type="button" className="btn-secondary" onClick={cerrarModales}>Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Unidad */}
      {modalUnidad && (
        <div className="modal-overlay"><div className="modal-content"><h2>{editandoId ? 'Editar' : 'Añadir'} Semana/Unidad</h2><form onSubmit={handleGuardarUnidad}><div className="form-group"><label>Título</label><input required className="form-control" value={formUnidad.titulo} onChange={e => setFormUnidad({...formUnidad, titulo: e.target.value})} /></div><div className="form-group"><label>Orden</label><input type="number" required className="form-control" value={formUnidad.orden} onChange={e => setFormUnidad({...formUnidad, orden: e.target.value})} /></div><div className="modal-actions"><button type="button" className="btn-secondary" onClick={cerrarModales}>Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div></form></div></div>
      )}

      {/* Modal Recurso */}
      {modalRecurso && (
        <div className="modal-overlay"><div className="modal-content"><h2>{editandoId ? 'Editar' : 'Añadir'} Recurso</h2><form onSubmit={handleGuardarRecurso}><div className="form-group"><label>Título</label><input required className="form-control" value={formRecurso.titulo} onChange={e => setFormRecurso({...formRecurso, titulo: e.target.value})} /></div><div className="form-group"><label>URL</label><input required className="form-control" value={formRecurso.url} onChange={e => setFormRecurso({...formRecurso, url: e.target.value})} /></div><div className="form-group"><label>Tipo</label><select className="form-control" value={formRecurso.tipo} onChange={e => setFormRecurso({...formRecurso, tipo: e.target.value})}><option value="link">Enlace Web</option><option value="pdf">Documento PDF</option><option value="video">Video</option></select></div><div className="modal-actions"><button type="button" className="btn-secondary" onClick={cerrarModales}>Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div></form></div></div>
      )}

      {/* Modal Actividad (Actualizado con Categorías) */}
      {modalActividad && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editandoId ? 'Editar' : 'Añadir'} Actividad</h2>
            <form onSubmit={handleGuardarActividad}>
              <div className="form-group"><label>Título</label><input required className="form-control" value={formActividad.titulo} onChange={e => setFormActividad({...formActividad, titulo: e.target.value})} /></div>
              
              <div className="form-group">
                <label>Descripción / Instrucciones (Opcional)</label>
                <textarea rows="3" className="form-control" value={formActividad.descripcion} onChange={e => setFormActividad({...formActividad, descripcion: e.target.value})} />
              </div>
              
              {/* NUEVO: Selector de Categoría (La bolsa de notas) */}
              <div className="form-group">
                <label>¿A qué bolsa de calificación pertenece?</label>
                <select required className="form-control" value={formActividad.categoria_id} onChange={e => setFormActividad({...formActividad, categoria_id: e.target.value})} style={{border: '2px solid #0284c7', backgroundColor: '#f0f9ff'}}>
                  <option value="">Selecciona una categoría...</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre} (Vale el {cat.porcentaje}%)</option>
                  ))}
                </select>
                {categorias.length === 0 && <span style={{fontSize: '0.8rem', color: '#e11d48'}}>⚠️ Primero debes crear una categoría en la pestaña "Parámetros de Calificación".</span>}
              </div>
              
              <div className="form-group">
                <label>Tipo</label>
                <select className="form-control" value={formActividad.tipo} onChange={e => setFormActividad({...formActividad, tipo: e.target.value})}>
                  <option value="tarea">Subida de Tarea (PDF)</option><option value="foro">Foro de Discusión</option><option value="examen">Prueba / Examen</option>
                </select>
              </div>
              
              <div className="modal-grid">
                <div className="form-group"><label>Apertura</label><input type="datetime-local" className="form-control" value={formActividad.apertura} onChange={e => setFormActividad({...formActividad, apertura: e.target.value})} /></div>
                <div className="form-group"><label>Cierre</label><input type="datetime-local" className="form-control" value={formActividad.cierre} onChange={e => setFormActividad({...formActividad, cierre: e.target.value})} /></div>
              </div>
              
              <div className="modal-actions"><button type="button" className="btn-secondary" onClick={cerrarModales}>Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PanelClaseProfesor;