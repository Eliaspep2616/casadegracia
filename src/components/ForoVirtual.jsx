import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, User, MessageSquare } from 'lucide-react';

const ForoVirtual = () => {
  const { actividadId } = useParams();
  const navigate = useNavigate();
  
  const [foro, setForo] = useState(null);
  const [todosLosComentarios, setTodosLosComentarios] = useState([]);
  
  // Estados para crear un TEMA NUEVO
  const [nuevoAsunto, setNuevoAsunto] = useState('');
  const [nuevoTema, setNuevoTema] = useState('');
  const [mostrandoCajaTema, setMostrandoCajaTema] = useState(false);
  
  // Estados para la vista de HILO/RÉPLICA
  const [temaActivo, setTemaActivo] = useState(null);
  const [nuevaReplica, setNuevaReplica] = useState('');
  const [mostrandoCajaReplica, setMostrandoCajaReplica] = useState(false);

  const [usuarioActual, setUsuarioActual] = useState(null);

  const cargarForo = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) setUsuarioActual(session.user);

    const { data: actData } = await supabase.from('actividades').select('*').eq('id', actividadId).single();
    if (actData) setForo(actData);

    // Traemos TODOS los comentarios (temas principales y réplicas)
    const { data: comData } = await supabase
      .from('foros_comentarios')
      .select(`id, asunto, mensaje, creado_en, usuario_id, padre_id, perfil:perfiles(nombre_completo)`)
      .eq('actividad_id', actividadId)
      .order('creado_en', { ascending: true }); // Orden cronológico para leer bien las respuestas

    if (comData) setTodosLosComentarios(comData);
  };

  useEffect(() => { cargarForo(); }, [actividadId]);

  const handleCrearTema = async (e) => {
    e.preventDefault();
    if (!nuevoTema.trim() || !nuevoAsunto.trim() || !usuarioActual) return;
    
    await supabase.from('foros_comentarios').insert([{ 
      actividad_id: actividadId, 
      usuario_id: usuarioActual.id, 
      asunto: nuevoAsunto,
      mensaje: nuevoTema,
      padre_id: null // Es un tema principal
    }]);
    
    setNuevoAsunto(''); setNuevoTema(''); setMostrandoCajaTema(false);
    cargarForo();
  };

  const handleEnviarReplica = async (e) => {
    e.preventDefault();
    if (!nuevaReplica.trim() || !usuarioActual || !temaActivo) return;
    
    await supabase.from('foros_comentarios').insert([{ 
      actividad_id: actividadId, 
      usuario_id: usuarioActual.id, 
      asunto: `Re: ${temaActivo.asunto}`, // Se autocompleta el "Re:"
      mensaje: nuevaReplica,
      padre_id: temaActivo.id // Aquí lo vinculamos como hijo
    }]);
    
    setNuevaReplica(''); setMostrandoCajaReplica(false);
    cargarForo();
  };

  // Separar los temas principales de las réplicas
  const temasPrincipales = todosLosComentarios.filter(c => c.padre_id === null).reverse(); // Nuevos arriba
  
  // Si hay un tema activo, filtramos sus respuestas
  const respuestasDelTema = temaActivo ? todosLosComentarios.filter(c => c.padre_id === temaActivo.id) : [];

  return (
    <div className="aula-page-container" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '50px' }}>
      <div className="aula-main-wrapper" style={{ maxWidth: '1200px', backgroundColor: 'white', padding: '40px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
        
        {/* BOTONERA SUPERIOR */}
        {temaActivo ? (
          <button onClick={() => setTemaActivo(null)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#0f6cbd', fontWeight: '600', cursor: 'pointer', marginBottom: '20px' }}>
            <ArrowLeft size={16} /> Volver a la lista de debates
          </button>
        ) : (
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#0f6cbd', fontWeight: '600', cursor: 'pointer', marginBottom: '20px' }}>
            <ArrowLeft size={16} /> Volver al curso
          </button>
        )}

        <h1 style={{ margin: '0 0 20px 0', fontSize: '1.8rem', color: '#212529', borderBottom: '1px solid #dee2e6', paddingBottom: '15px' }}>
          {foro?.titulo}
        </h1>

        {/* --- VISTA 1: LA TABLA GENERAL DE DEBATES --- */}
        {!temaActivo && (
          <>
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', border: '1px solid #dee2e6', marginBottom: '30px' }}>
              <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#495057' }}><strong>Vencimiento:</strong> {foro?.cierre ? new Date(foro.cierre).toLocaleString() : 'Sin límite'}</p>
              <div style={{ color: '#212529', lineHeight: '1.6' }}>{foro?.descripcion ? <p>{foro.descripcion}</p> : <p>Participa en este foro de discusión.</p>}</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <button onClick={() => setMostrandoCajaTema(!mostrandoCajaTema)} style={{ backgroundColor: '#0f6cbd', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
                Añadir un nuevo tema de debate
              </button>
            </div>

            {mostrandoCajaTema && (
              <form onSubmit={handleCrearTema} style={{ marginBottom: '30px', backgroundColor: '#f8f9fa', padding: '20px', border: '1px solid #dee2e6' }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Asunto</label>
                  <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }} value={nuevoAsunto} onChange={(e) => setNuevoAsunto(e.target.value)} required />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Mensaje</label>
                  <textarea rows="5" style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }} value={nuevoTema} onChange={(e) => setNuevoTema(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ backgroundColor: '#0f6cbd', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Enviar al foro</button>
                  <button type="button" onClick={() => setMostrandoCajaTema(false)} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                </div>
              </form>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '2px solid #dee2e6', fontSize: '0.95rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#0f6cbd' }}>Debate</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#0f6cbd' }}>Comenzado por</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Réplicas</th>
                </tr>
              </thead>
              <tbody>
                {temasPrincipales.map(tema => {
                  // Contar cuántas respuestas tiene este tema específico
                  const conteoReplicas = todosLosComentarios.filter(c => c.padre_id === tema.id).length;
                  return (
                    <tr key={tema.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '15px' }}>
                        <button onClick={() => setTemaActivo(tema)} style={{ background: 'none', border: 'none', padding: 0, color: '#0f6cbd', fontWeight: '700', cursor: 'pointer', fontSize: '1rem', textDecoration: 'none' }}>
                          {tema.asunto}
                        </button>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} color="#6c757d"/></div>
                          <span>{tema.perfil?.nombre_completo}<br/><small style={{ color: '#6c757d' }}>{new Date(tema.creado_en).toLocaleDateString()}</small></span>
                        </div>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold' }}>{conteoReplicas}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        )}

        {/* --- VISTA 2: EL HILO DEL DEBATE (MENSAJE ORIGINAL + RÉPLICAS) --- */}
        {temaActivo && (
          <div>
            {/* Mensaje Padre */}
            <div style={{ backgroundColor: '#eef2f5', padding: '25px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#0f6cbd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={24} color="white"/></div>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#212529' }}>{temaActivo.asunto}</h3>
                    <span style={{ fontSize: '0.9rem', color: '#495057' }}>por <strong>{temaActivo.perfil?.nombre_completo}</strong> - {new Date(temaActivo.creado_en).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <p style={{ color: '#212529', lineHeight: '1.6', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>{temaActivo.mensaje}</p>
              
              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button onClick={() => setMostrandoCajaReplica(!mostrandoCajaReplica)} style={{ color: '#0f6cbd', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}>
                  Responder
                </button>
              </div>
            </div>

            {/* Formulario de Réplica */}
            {mostrandoCajaReplica && (
              <form onSubmit={handleEnviarReplica} style={{ marginLeft: '40px', marginBottom: '30px', backgroundColor: '#f8f9fa', padding: '20px', border: '1px solid #dee2e6', borderLeft: '4px solid #0f6cbd' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>Escribe tu respuesta:</label>
                <textarea rows="4" style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px', marginBottom: '10px' }} value={nuevaReplica} onChange={(e) => setNuevaReplica(e.target.value)} required />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ backgroundColor: '#0f6cbd', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Enviar réplica</button>
                  <button type="button" onClick={() => setMostrandoCajaReplica(false)} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                </div>
              </form>
            )}

            {/* Lista de Respuestas (Hijos) */}
            {respuestasDelTema.map(rep => (
              <div key={rep.id} style={{ marginLeft: '40px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#6c757d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} color="white"/></div>
                  <span style={{ fontSize: '0.9rem', color: '#495057' }}><strong>{rep.perfil?.nombre_completo}</strong> respondió el {new Date(rep.creado_en).toLocaleString()}:</span>
                </div>
                <h4 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '0.95rem' }}>{rep.asunto}</h4>
                <p style={{ color: '#212529', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>{rep.mensaje}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ForoVirtual;