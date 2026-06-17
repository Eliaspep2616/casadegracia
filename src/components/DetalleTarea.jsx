import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, FileText, UploadCloud, Loader } from 'lucide-react';
import './AulaVirtual.css'; // Usaremos los mismos estilos base

const DetalleTarea = () => {
  const { actividadId } = useParams();
  const navigate = useNavigate();
  
  const [tarea, setTarea] = useState(null);
  const [entrega, setEntrega] = useState(null);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);

  const cargarDatos = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) setUsuarioActual(session.user);

    // Cargar info de la tarea
    const { data: actData } = await supabase.from('actividades').select('*').eq('id', actividadId).single();
    if (actData) setTarea(actData);

    // Cargar entrega del alumno
    if (session && actData) {
      const { data: entData } = await supabase.from('entregas_tareas').select('*').eq('tarea_id', actData.id).eq('estudiante_id', session.user.id).single();
      if (entData) setEntrega(entData);
    }
    setLoading(false);
  };

  useEffect(() => { cargarDatos(); }, [actividadId]);

  const handleSubirArchivo = async (e) => {
    const file = e.target.files[0];
    if (!file || !usuarioActual) return;
    setSubiendo(true);

    try {
      const extension = file.name.split('.').pop();
      const nombreSeguro = `actividad_${tarea.id}_alumno_${usuarioActual.id}.${extension}`;
      const rutaArchivo = `entregas_2026/${nombreSeguro}`;

      await supabase.storage.from('campus_storage').upload(rutaArchivo, file, { upsert: true });

      await supabase.from('entregas_tareas').upsert({
        tarea_id: tarea.id,
        estudiante_id: usuarioActual.id,
        archivo_url: rutaArchivo,
        entregado_en: new Date().toISOString()
      }, { onConflict: 'tarea_id, estudiante_id' });

      cargarDatos(); // Recargar para mostrar la tabla actualizada
    } catch (error) {
      alert("Error al subir archivo");
    }
    setSubiendo(false);
  };

  if (loading) return <div className="loading-screen">Cargando Tarea...</div>;

  // Cálculos para la tabla estilo UG
  const estadoEntrega = entrega ? 'Enviado para calificar' : 'No se ha enviado nada en esta tarea';
  const estadoCalificacion = entrega?.calificacion ? `Calificado (${entrega.calificacion}/100)` : 'Sin calificar';
  const colorFondoEstado = entrega ? '#dcfce7' : '#f1f5f9';

  return (
    <div className="aula-page-container" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="aula-main-wrapper" style={{ maxWidth: '1000px', backgroundColor: 'white', padding: '40px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
        
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#0f6cbd', fontWeight: '600', cursor: 'pointer', marginBottom: '30px' }}>
          <ArrowLeft size={16} /> Volver al curso
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '20px', marginBottom: '20px' }}>
          <FileText size={32} color="#e83e8c" />
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#212529' }}>{tarea?.titulo}</h1>
        </div>

        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', border: '1px solid #dee2e6', marginBottom: '20px', fontSize: '0.9rem' }}>
          {tarea?.apertura && <div><strong>Apertura:</strong> {new Date(tarea.apertura).toLocaleString()}</div>}
          {tarea?.cierre && <div><strong>Cierre:</strong> {new Date(tarea.cierre).toLocaleString()}</div>}
        </div>

        <div style={{ marginBottom: '30px', color: '#212529', lineHeight: '1.6' }}>
          {tarea?.descripcion ? <p>{tarea.descripcion}</p> : <p style={{ fontStyle: 'italic', color: '#6c757d' }}>Sin instrucciones adicionales.</p>}
        </div>

        {!entrega?.calificacion && (
          <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f6cbd', color: 'white', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', marginBottom: '30px', minWidth: '150px' }}>
            {subiendo ? <Loader size={18} className="animate-spin" /> : 'Agregar entrega'}
            <input type="file" accept=".pdf" onChange={handleSubirArchivo} style={{ display: 'none' }} disabled={subiendo} />
          </label>
        )}

        <h3 style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '10px', marginBottom: '20px' }}>Estado de la entrega</h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #dee2e6', fontSize: '0.95rem' }}>
          <tbody>
            <tr>
              <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6', backgroundColor: '#f8f9fa', fontWeight: 'bold', width: '25%' }}>Estado de la entrega</td>
              <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6', backgroundColor: colorFondoEstado }}>{estadoEntrega}</td>
            </tr>
            <tr>
              <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6', backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>Estado de la calificación</td>
              <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6' }}>{estadoCalificacion}</td>
            </tr>
            <tr>
              <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6', backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>Última modificación</td>
              <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6' }}>{entrega ? new Date(entrega.entregado_en).toLocaleString() : '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6', backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>Comentarios de la entrega</td>
              <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6', color: '#0f6cbd' }}>▸ Comentarios (0)</td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
};

export default DetalleTarea;