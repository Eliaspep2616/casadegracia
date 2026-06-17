import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, FileText, CheckSquare, MessageCircle, Eye, UploadCloud, Loader, CheckCircle, RefreshCw, Award } from 'lucide-react';
import './AulaVirtual.css';

const AulaVirtual = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [perfilAlumno, setPerfilAlumno] = useState(null); // Para mostrar su nombre en el reporte
  
  const [pestañaActiva, setPestañaActiva] = useState('curso'); // 'curso' o 'calificaciones'
  
  const [materia, setMateria] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const [entregas, setEntregas] = useState([]);

  useEffect(() => {
    const inicializarAula = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const user = session.user;
      setUsuarioActual(user);

      // Traer nombre del alumno
      const { data: perfilData } = await supabase.from('perfiles').select('nombre_completo').eq('id', user.id).single();
      if (perfilData) setPerfilAlumno(perfilData);

      // Cargar detalles de la materia
      const { data: materiaData } = await supabase.from('materias').select('id, nombre_materia, profesor:perfiles(nombre_completo)').eq('id', id).single();
      if (materiaData) setMateria(materiaData);

      // Cargar estructura
      const { data: unidadesData } = await supabase
        .from('unidades')
        .select(`id, titulo, orden, recursos(id, titulo, url, tipo), actividades(id, titulo, tipo, apertura, cierre, visible)`)
        .eq('materia_id', id)
        .order('orden', { ascending: true });

      if (unidadesData) {
        const unidadesFiltradas = unidadesData.map(u => ({ ...u, actividades: u.actividades.filter(a => a.visible === true) }));
        setUnidades(unidadesFiltradas);

        // Cargar entregas del alumno
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

  // Función para obtener las iniciales del estudiante (Ej: Juan Perez -> JP)
  const getIniciales = (nombre) => {
    if (!nombre) return 'US';
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) return <div className="loading-screen">Cargando Campus Virtual...</div>;

  return (
    <div className="aula-page-container">
      {/* BARRA DE NAVEGACIÓN SUPERIOR ESTILO UG */}
      <div className="ug-top-nav">
        <div className="ug-nav-links">
          <button className={pestañaActiva === 'curso' ? 'active' : ''} onClick={() => setPestañaActiva('curso')}>Curso</button>
          <button className={pestañaActiva === 'calificaciones' ? 'active' : ''} onClick={() => setPestañaActiva('calificaciones')}>Calificaciones</button>
        </div>
      </div>

      <div className="aula-main-wrapper">
        <button onClick={() => navigate('/portal-estudiante')} className="btn-volver">
          <ArrowLeft size={20} /> VOLVER AL DASHBOARD
        </button>

        <div className="aula-header">
          <h1 className="aula-materia-title">{materia?.nombre_materia}</h1>
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
                  {/* Fila del nombre de la materia */}
                  <tr className="fila-categoria-principal">
                    <td colSpan="7"><strong>⌄ {materia?.nombre_materia?.toUpperCase()}</strong></td>
                  </tr>

                  {/* Iterar sobre unidades y actividades */}
                  {unidades.map(unidad => {
                    if (unidad.actividades.length === 0) return null;
                    return (
                      <React.Fragment key={unidad.id}>
                        <tr className="fila-subcategoria">
                          <td colSpan="7"><strong>⌄ {unidad.titulo.toUpperCase()}</strong></td>
                        </tr>
                        {unidad.actividades.map(act => {
                          const entrega = entregas.find(e => e.tarea_id === act.id);
                          const nota = entrega?.calificacion;
                          const tieneNota = nota !== null && nota !== undefined;

                          return (
                            <tr key={act.id} className="fila-actividad">
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '20px' }}>
                                  {getIconoActividad(act.tipo)}
                                  <span style={{ color: '#0f6cbd', fontWeight: '600' }}>{act.titulo}</span>
                                </div>
                              </td>
                              <td>-</td>
                              <td>{tieneNota ? <strong style={{ color: '#212529' }}>{nota},00</strong> : '-'}</td>
                              <td>0–100</td>
                              <td>{tieneNota ? `${nota},00 %` : '-'}</td>
                              <td>{tieneNota ? 'Calificado' : ''}</td>
                              <td>-</td>
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
                    <td><strong>-</strong></td>
                    <td>0–100</td>
                    <td>-</td>
                    <td></td>
                    <td>-</td>
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