import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Plus, Edit2, Trash2, Link as LinkIcon, FileText, CheckSquare, MessageCircle, EyeOff, Settings } from 'lucide-react';
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
  const [formActividad, setFormActividad] = useState({ 
    titulo: '', descripcion: '', tipo: 'tarea', apertura: '', cierre: '', visible: true, permite_atrasos: true 
  });

  const cargarDatos = async () => {
    setLoading(true);
    
    const { data: matData } = await supabase.from('materias').select('id, nombre_materia, nivel_id').eq('id', id).single();
    if (matData) setMateria(matData);

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
      permite_atrasos: actividad.permite_atrasos !== undefined ? actividad.permite_atrasos : true 
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
    const datos = { 
      titulo: formActividad.titulo, 
      descripcion: formActividad.descripcion, 
      tipo: formActividad.tipo, 
      apertura: formActividad.apertura || null, 
      cierre: formActividad.cierre || null, 
      visible: formActividad.visible === 'true' || formActividad.visible === true,
      permite_atrasos: formActividad.permite_atrasos === 'true' || formActividad.permite_atrasos === true 
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
    setEditandoId(null);
    setFormUnidad({ titulo: '', orden: 1 });
    setFormRecurso({ titulo: '', url: '', tipo: 'link' });
    setFormActividad({ titulo: '', descripcion: '', tipo: 'tarea', apertura: '', cierre: '', visible: true, permite_atrasos: true });
  };

  const getIconoActividad = (tipo) => {
    if (tipo === 'tarea') return <FileText size={18} color="#e11d48" />;
    if (tipo === 'examen') return <CheckSquare size={18} color="#0284c7" />;
    if (tipo === 'foro') return <MessageCircle size={18} color="#16a34a" />;
    return <FileText size={18} />;
  };

  const handleVerPDF = async (rutaArchivo) => {
    const { data, error } = await supabase.storage.from('campus_storage').createSignedUrl(rutaArchivo, 60);
    if (data) window.open(data.signedUrl, '_blank');
    else alert("Error al abrir el archivo. Puede que haya sido eliminado.");
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
          <button onClick={() => setPestañaActiva('calificaciones')} className={`btn-tab ${pestañaActiva === 'calificaciones' ? 'active' : 'inactive'}`}>Centro de Calificaciones</button>
        </div>

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
                      {unidad.actividades.map(actividad => (
                        <div key={actividad.id} className="ug-item-actividad item-flex-between">
                          <div className="actividad-inner-flex">
                            <div className="actividad-icon-wrapper">{getIconoActividad(actividad.tipo)}</div>
                            <div>
                              
                              <div className="armar-examen-wrapper">
                                <span className="ug-link">{actividad.titulo}</span>
                                
                                {actividad.tipo === 'examen' && (
                                  <button 
                                    onClick={() => navigate(`/editor-examen/${actividad.id}`)}
                                    className="btn-armar-examen">
                                    ⚙️ Armar Examen
                                  </button>
                                )}
                              </div>

                              <div className="ug-fechas">
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
                      ))}
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
                      <th>ESTADO</th>
                      <th>ARCHIVO / APORTE</th>
                      <th>CALIFICACIÓN (/100)</th>
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
                        if (entrega && entrega.entregado_en) {
                           esAtrasado = new Date(entrega.entregado_en) > fechaCierre;
                        } else {
                           esAtrasado = new Date() > fechaCierre;
                        }
                      }

                      return (
                        <tr key={alumno.id}>
                          <td>
                            <strong>{alumno.nombre_completo}</strong><br/>
                            <span className="estudiante-cedula">C.I: {alumno.cedula}</span>
                          </td>
                          
                          <td>
                            <div className="estado-wrapper">
                              {entrega?.calificacion ? (
                                <span className="estado-calificado">Calificado</span>
                              ) : entrega || esForo ? (
                                <span className="estado-pendiente">Pendiente de evaluar</span>
                              ) : (
                                <span className="estado-no-entregado">No Entregado</span>
                              )}
                              
                              {esAtrasado && (
                                <span className="estado-atrasado">
                                  ⚠️ ATRASADO
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            {esForo ? (
                              <button onClick={() => navigate(`/foro/${actividadSeleccionadaId}`)} className="btn-view-pdf btn-ver-foro">
                               🗣️ Ver Foro
                              </button>
                            ) : entrega?.archivo_url ? (
                              <button onClick={() => handleVerPDF(entrega.archivo_url)} className="btn-view-pdf">
                                📄 Ver PDF
                              </button>
                            ) : (
                              <span className="sin-archivo-text">Sin archivo</span>
                            )}
                          </td>
                          
                          <td>
                            {editandoNotaId === alumno.id ? (
                              <div className="grade-edit-wrapper">
                                <div className="grade-input-group">
                                  <input 
                                    type="number" 
                                    className="grade-input" 
                                    placeholder={entrega?.calificacion || "0"} 
                                    value={notasTemporales[alumno.id] !== undefined ? notasTemporales[alumno.id] : ''} 
                                    onChange={(e) => setNotasTemporales({...notasTemporales, [alumno.id]: e.target.value})} 
                                  />
                                  <button onClick={async () => {
                                    if (!notasTemporales[alumno.id]) return; 
                                    
                                    const { error } = await supabase.from('entregas_tareas').upsert({
                                      tarea_id: actividadSeleccionadaId,
                                      estudiante_id: alumno.id,
                                      calificacion: notasTemporales[alumno.id],
                                      comentario_profesor: !esForo ? (comentariosTemporales[alumno.id] || '') : '', 
                                      calificado_en: new Date().toISOString(),
                                      archivo_url: entrega?.archivo_url || 'Calificación directa - Sin entrega'
                                    }, { onConflict: 'tarea_id, estudiante_id' });

                                    if (!error) {
                                      alert(!esForo ? "¡Nota y comentario guardados!" : "¡Nota guardada!");
                                      setEditandoNotaId(null); 
                                      cargarDatos();
                                    }
                                  }} className="btn-guardar-nota">Guardar</button>
                                  
                                  <button onClick={() => setEditandoNotaId(null)} className="btn-cerrar-nota">X</button>
                                </div>
                                
                                {!esForo && (
                                  <textarea 
                                    placeholder="Añadir retroalimentación (opcional)..." 
                                    className="textarea-comentario"
                                    rows="2"
                                    value={comentariosTemporales[alumno.id] !== undefined ? comentariosTemporales[alumno.id] : ''}
                                    onChange={(e) => setComentariosTemporales({...comentariosTemporales, [alumno.id]: e.target.value})}
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="nota-display-wrapper">
                                <div className="nota-display-inner">
                                  <span className={`nota-valor ${entrega?.calificacion != null ? 'nota-valor-has' : 'nota-valor-empty'}`}>
                                    {entrega?.calificacion != null ? `${entrega.calificacion} / 100` : '- / 100'}
                                  </span>
                                  <button onClick={() => {
                                    setNotasTemporales({...notasTemporales, [alumno.id]: entrega?.calificacion || ''});
                                    if (!esForo) {
                                      setComentariosTemporales({...comentariosTemporales, [alumno.id]: entrega?.comentario_profesor || ''});
                                    }
                                    setEditandoNotaId(alumno.id);
                                  }} className="btn-editar-nota">
                                    ✏️ {entrega?.calificacion != null ? 'Editar' : 'Calificar'}
                                  </button>
                                </div>
                                
                                {!esForo && entrega?.comentario_profesor && (
                                  <div className="comentario-display">
                                    💬 {entrega.comentario_profesor}
                                  </div>
                                )}
                              </div>
                            )}
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

      {modalUnidad && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editandoId ? 'Editar' : 'Añadir'} Semana/Unidad</h2>
            <form onSubmit={handleGuardarUnidad}>
              <div className="form-group"><label>Título</label><input required className="form-control" value={formUnidad.titulo} onChange={e => setFormUnidad({...formUnidad, titulo: e.target.value})} /></div>
              <div className="form-group"><label>Orden</label><input type="number" required className="form-control" value={formUnidad.orden} onChange={e => setFormUnidad({...formUnidad, orden: e.target.value})} /></div>
              <div className="modal-actions"><button type="button" className="btn-secondary" onClick={cerrarModales}>Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {modalRecurso && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editandoId ? 'Editar' : 'Añadir'} Recurso</h2>
            <form onSubmit={handleGuardarRecurso}>
              <div className="form-group"><label>Título</label><input required className="form-control" value={formRecurso.titulo} onChange={e => setFormRecurso({...formRecurso, titulo: e.target.value})} /></div>
              <div className="form-group"><label>URL</label><input required className="form-control" value={formRecurso.url} onChange={e => setFormRecurso({...formRecurso, url: e.target.value})} /></div>
              <div className="form-group"><label>Tipo</label><select className="form-control" value={formRecurso.tipo} onChange={e => setFormRecurso({...formRecurso, tipo: e.target.value})}><option value="link">Enlace Web</option><option value="pdf">Documento PDF</option><option value="video">Video</option></select></div>
              <div className="modal-actions"><button type="button" className="btn-secondary" onClick={cerrarModales}>Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {modalActividad && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editandoId ? 'Editar' : 'Añadir'} Actividad</h2>
            <form onSubmit={handleGuardarActividad}>
              <div className="form-group"><label>Título</label><input required className="form-control" value={formActividad.titulo} onChange={e => setFormActividad({...formActividad, titulo: e.target.value})} /></div>
              
              <div className="form-group">
                <label>Descripción / Instrucciones (Opcional)</label>
                <textarea rows="3" className="form-control" placeholder="Escribe aquí las instrucciones..." value={formActividad.descripcion} onChange={e => setFormActividad({...formActividad, descripcion: e.target.value})} />
              </div>
              
              {formActividad.tipo === 'tarea' && (
                <div className="form-group">
                  <label>Entregas Atrasadas</label>
                  <select className="form-control" value={formActividad.permite_atrasos} onChange={e => setFormActividad({...formActividad, permite_atrasos: e.target.value})}>
                    <option value="true">Permitir (Se marcarán como "Atrasado")</option>
                    <option value="false">Bloquear (No podrán subir el archivo)</option>
                  </select>
                </div>
              )}
              
              <div className="form-group">
                <label>Tipo</label>
                <select className="form-control" value={formActividad.tipo} onChange={e => setFormActividad({...formActividad, tipo: e.target.value})}>
                  <option value="tarea">Subida de Tarea (PDF)</option>
                  <option value="foro">Foro de Discusión</option>
                  <option value="examen">Prueba / Examen</option>
                </select>
              </div>
              
              <div className="modal-grid">
                <div className="form-group"><label>Apertura</label><input type="datetime-local" className="form-control" value={formActividad.apertura} onChange={e => setFormActividad({...formActividad, apertura: e.target.value})} /></div>
                <div className="form-group"><label>Cierre</label><input type="datetime-local" className="form-control" value={formActividad.cierre} onChange={e => setFormActividad({...formActividad, cierre: e.target.value})} /></div>
              </div>
              
              <div className="form-group">
                <label>Visibilidad</label>
                <select className="form-control" value={formActividad.visible} onChange={e => setFormActividad({...formActividad, visible: e.target.value})}>
                  <option value="true">Visible para estudiantes</option>
                  <option value="false">Oculto (Borrador)</option>
                </select>
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