                        import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { ArrowLeft, FileText, CheckSquare, MessageCircle } from 'lucide-react';
import './AulaVirtual.css';

const AulaVirtual = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [perfilAlumno, setPerfilAlumno] = useState(null); 
  
  const [pestañaActiva, setPestañaActiva] = useState('curso'); 
  
  const [materia, setMateria] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [categorias, setCategorias] = useState([]); 

  useEffect(() => {
    const inicializarAula = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const user = session.user;
      setUsuarioActual(user);

      const { data: perfilData } = await supabase.from('perfiles').select('nombre_completo').eq('id', user.id).single();
      if (perfilData) setPerfilAlumno(perfilData);

      const { data: materiaData } = await supabase.from('materias').select('id, nombre_materia, profesor:perfiles(nombre_completo)').eq('id', id).single();
      if (materiaData) setMateria(materiaData);

      const { data: catData } = await supabase.from('categorias_notas').select('*').eq('materia_id', id);
      if (catData) setCategorias(catData);

      const { data: unidadesData } = await supabase
        .from('unidades')
        .select(`id, titulo, orden, recursos(id, titulo, url, tipo), actividades(id, titulo, tipo, apertura, cierre, visible, categoria_id)`)
        .eq('materia_id', id)
        .order('orden', { ascending: true });

      if (unidadesData) {
        const unidadesFiltradas = unidadesData.map(u => ({ ...u, actividades: u.actividades.filter(a => a.visible === true) }));
        setUnidades(unidadesFiltradas);

        const actividadesIds = unidadesFiltradas.flatMap(u => u.actividades).map(a => a.id);
        if (actividadesIds.length > 0) {
          const { data: entregasData } = await supabase.from('entregas_tareas').select('*').eq('estudiante_id', user.id).in('tarea_id', actividadesIds);
          if (entregasData) setEntregas(entregasData);
        }
      }
      setLoading(false);
    };

    inicializarAula();
  }, [id]);

  const getIconoActividad = (tipo) => {
    if (tipo === 'tarea') return <FileText size={18} color="#e11d48" />;
    if (tipo === 'examen') return <CheckSquare size={18} color="#0284c7" />;
    if (tipo === 'foro') return <MessageCircle size={18} color="#16a34a" />;
    return <FileText size={18} />;
  };

  const getIniciales = (nombre) => {
    if (!nombre) return 'US';
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // ==========================================
  // MOTOR MATEMÁTICO
  // ==========================================
  const todasLasActividades = unidades.flatMap(u => u.actividades).filter(a => a.tipo === 'tarea' || a.tipo === 'foro');
  let notaFinalCalculada = 0;

  todasLasActividades.forEach(act => {
    const entrega = entregas.find(e => e.tarea_id === act.id);
    if (entrega && entrega.calificacion != null) {
      const cat = categorias.find(c => c.id === act.categoria_id);
      if (cat) {
        const actsCat = todasLasActividades.filter(a => a.categoria_id === cat.id);
        const peso = Number(cat.porcentaje) / actsCat.length;
        notaFinalCalculada += (Number(entrega.calificacion) / 100) * peso;
      }
    }
  });

  if (loading) return <div className="loading-screen">Cargando Campus Virtual...</div>;

  return (
    <div className="aula-page-container">
      <div className="aula-main-wrapper">
        
        {/* BOTÓN VOLVER ARREGLADO */}
        <button onClick={() => navigate('/dashboard')} className="btn-volver">
          <ArrowLeft size={20} /> VOLVER AL DASHBOARD
        </button>

        <div className="aula-header">
          <p className="aula-docente-label">DOCENTE: {materia?.profesor?.nombre_completo?.toUpperCase()}</p>
          <h1 className="aula-materia-title">{materia?.nombre_materia}</h1>
        </div>

        {/* PESTAÑAS LIMPIAS (TU CSS ORIGINAL) */}
        <div className="aula-tabs">
          <button className={`btn-tab ${pestañaActiva === 'curso' ? 'active' : 'inactive'}`} onClick={() => setPestañaActiva('curso')}>
            Contenido del Curso
          </button>
          <button className={`btn-tab ${pestañaActiva === 'calificaciones' ? 'active' : 'inactive'}`} onClick={() => setPestañaActiva('calificaciones')}>
            Calificaciones
          </button>
        </div>

        {/* ================= VISTA: CURSO ================= */}
        {pestañaActiva === 'curso' && (
          <div className="campus-ug-layout">
            {unidades.length === 0 ? (
              <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#777' }}>El docente aún no ha publicado contenido.</div>
            ) : (
              unidades.map(unidad => (
                <div key={unidad.id} className="ug-unidad-card">
                  <div className="ug-unidad-header"><h2>{unidad.titulo}</h2></div>
                  
                  {unidad.recursos.length > 0 && (
                    <div className="ug-seccion">
                      <h4 className="ug-seccion-title">RECURSOS</h4>
                      <div className="ug-lista-items">
                        {unidad.recursos.map(recurso => (
                          <div key={recurso.id} className="ug-item">
                            <a href={recurso.url} target="_blank" rel="noreferrer" className="ug-link">{recurso.titulo}</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {unidad.actividades.length > 0 && (
                    <div className="ug-seccion">
                      <h4 className="ug-seccion-title">ACTIVIDADES Y EVALUACIÓN</h4>
                      <div className="ug-lista-items">
                        {unidad.actividades.map(actividad => (
                          <div key={actividad.id} className="ug-item-actividad" style={{ alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {getIconoActividad(actividad.tipo)}
                              <button onClick={() => navigate(`/${actividad.tipo === 'foro' ? 'foro' : 'tarea'}/${actividad.id}`)} style={{ background: 'none', border: 'none', fontWeight: '700', color: '#0f6cbd', cursor: 'pointer', padding: 0, fontSize: '1rem' }}>
                                {actividad.titulo}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ================= VISTA: CALIFICACIONES ================= */}
        {pestañaActiva === 'calificaciones' && (
          <div className="reporte-calificaciones-container">
            
            <div className="reporte-usuario-header">
              <h3>Usuario <span style={{fontSize: '0.8rem'}}>▼</span></h3>
              <div className="usuario-badge-row">
                <div className="avatar-circulo">{getIniciales(perfilAlumno?.nombre_completo)}</div>
                <h2>{perfilAlumno?.nombre_completo?.toUpperCase()}</h2>
              </div>
            </div>

            <div className="tabla-calificaciones-wrapper">
              <table className="tabla-calificaciones">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Ítem de calificación</th>
                    <th>Ponderación calculada</th>
                    <th>Calificación</th>
                    <th>Rango</th>
                    <th>Porcentaje</th>
                    <th>Retroalimentación</th>
                    <th>Aporta al total del curso</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="fila-categoria-principal">
                    <td colSpan="7"><strong>⌄ {materia?.nombre_materia?.toUpperCase()}</strong></td>
                  </tr>

                  {/* AHORA AGRUPAMOS POR CATEGORÍA (Bolsas de notas) */}
                  {categorias.map(cat => {
                    const actsCat = todasLasActividades.filter(a => a.categoria_id === cat.id);
                    if (actsCat.length === 0) return null;

                    const pesoPorTarea = Number(cat.porcentaje) / actsCat.length;

                    return (
                      <React.Fragment key={cat.id}>
                        {/* Título de la bolsa (Ej: ACTIVIDADES EN CLASE) */}
                        <tr className="fila-subcategoria">
                          <td colSpan="7">
                            <strong style={{ color: '#0f4c81' }}>⌄ {cat.nombre.toUpperCase()} (Vale {cat.porcentaje}%)</strong>
                          </td>
                        </tr>
                        
                        {/* Tareas que pertenecen a esta bolsa */}
                        {actsCat.map(act => {
                          const entrega = entregas.find(e => e.tarea_id === act.id);
                          const nota = entrega?.calificacion != null ? Number(entrega.calificacion) : null;
                          const tieneNota = nota !== null;
                          const aporteFinal = tieneNota ? (nota / 100) * pesoPorTarea : 0;

                          return (
                            <tr key={act.id} className="fila-actividad">
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '20px' }}>
                                  {getIconoActividad(act.tipo)}
                                  <span style={{ color: '#0f6cbd', fontWeight: '600' }}>{act.titulo}</span>
                                </div>
                              </td>
                              <td>{pesoPorTarea > 0 ? `${pesoPorTarea.toFixed(2)} %` : '-'}</td>
                              <td>{tieneNota ? <strong style={{ color: '#212529' }}>{nota.toFixed(2)}</strong> : '-'}</td>
                              <td>0–100</td>
                              <td>{tieneNota ? `${nota.toFixed(2)} %` : '-'}</td>
                              <td style={{ fontSize: '0.85rem' }}>{entrega?.comentario_profesor || (tieneNota ? 'Calificado' : '')}</td>
                              <td>{tieneNota && pesoPorTarea > 0 ? <strong style={{ color: '#0f4c81' }}>{aporteFinal.toFixed(2)} %</strong> : '-'}</td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                  
                  {/* Fila de Total del curso */}
                  <tr className="fila-total-curso">
                    <td><strong>Total del curso</strong></td>
                    <td>-</td>
                    <td><strong style={{ color: '#0f4c81' }}>{notaFinalCalculada > 0 ? notaFinalCalculada.toFixed(2) : '-'}</strong></td>
                    <td>0–100</td>
                    <td>-</td>
                    <td></td>
                    <td><strong style={{ color: '#0f4c81' }}>{notaFinalCalculada > 0 ? `${notaFinalCalculada.toFixed(2)} %` : '-'}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AulaVirtual;