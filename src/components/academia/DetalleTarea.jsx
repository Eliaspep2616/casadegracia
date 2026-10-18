import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { ArrowLeft, FileText, UploadCloud, Loader } from 'lucide-react';
import './AulaVirtual.css'; // Usaremos los mismos estilos base
import './DetalleTarea.css';
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

    // Cargar entrega del alumno (CAMBIADO A .maybeSingle())
    if (session && actData) {
      const { data: entData } = await supabase
        .from('entregas_tareas')
        .select('*')
        .eq('tarea_id', actData.id)
        .eq('estudiante_id', session.user.id)
        .maybeSingle(); // <-- Este es el cambio clave
        
      setEntrega(entData || null);
    }
    setLoading(false);
  };
  useEffect(() => { cargarDatos(); }, [actividadId]);

 const handleSubirArchivo = async (e) => {
  const file = e.target.files[0];
  if (!file || !usuarioActual) return;
  setSubiendo(true);

  // 1. Declarar las variables de la ruta del archivo
  const extension = file.name.split('.').pop();
  const nombreSeguro = `actividad_${tarea.id}_alumno_${usuarioActual.id}.${extension}`;
  const rutaArchivo = `entregas_2026/${nombreSeguro}`;

  // 2. Subir el archivo capturando posibles errores
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('campus_storage')
    .upload(rutaArchivo, file, { upsert: true });

  if (uploadError) {
    console.error("Error de Storage:", uploadError);
    alert(`Error al subir: ${uploadError.message}`);
    setSubiendo(false);
    return; // Detiene la ejecución si falla la subida
  }

  // 3. Guardar el registro en la base de datos
  const { error: dbError } = await supabase.from('entregas_tareas').upsert({
    tarea_id: tarea.id,
    estudiante_id: usuarioActual.id,
    archivo_url: rutaArchivo,
    entregado_en: new Date().toISOString()
  }, { onConflict: 'tarea_id, estudiante_id' });

  if (dbError) {
     console.error("Error de Base de Datos:", dbError);
     alert("El archivo se subió, pero hubo un error al guardar la entrega.");
  } else {
     cargarDatos(); // Refresca la vista si todo fue exitoso
  }
  
  setSubiendo(false);
};
const handleBorrarEntrega = async () => {
    const confirmar = window.confirm("¿Estás seguro de que deseas borrar esta entrega?");
    if (!confirmar) return;

    setSubiendo(true); // Usamos este estado para deshabilitar botones mientras carga

    try {
      // 1. Borrar el archivo físico del bucket de Supabase
      if (entrega?.archivo_url) {
        const { error: storageError } = await supabase.storage
          .from('campus_storage')
          .remove([entrega.archivo_url]);

        if (storageError) {
          console.error("Error al borrar de Storage:", storageError);
          // Si el archivo ya no existe, continuamos para al menos borrar el registro de la BD
        }
      }

      // 2. Borrar el registro de la base de datos
      const { error: dbError } = await supabase
        .from('entregas_tareas')
        .delete()
        .eq('tarea_id', tarea.id)
        .eq('estudiante_id', usuarioActual.id);

      if (dbError) throw dbError;

      // 3. Limpiar la pantalla y recargar
      setEntrega(null);
      await cargarDatos();
      
    } catch (error) {
      console.error("Error completo al borrar:", error);
      alert("Ocurrió un error al intentar borrar la entrega.");
    } finally {
      setSubiendo(false);
    }
  };

  if (loading) return <div className="loading-screen">Cargando Tarea...</div>;

  // Cálculos para la tabla estilo UG
  const estadoEntrega = entrega ? 'Enviado para calificar' : 'No se ha enviado nada en esta tarea';
  const estadoCalificacion = entrega?.calificacion ? `Calificado (${entrega.calificacion}/100)` : 'Sin calificar';
  const colorFondoEstado = entrega ? '#dcfce7' : '#f1f5f9';
return (
    <div className="aula-page-container">
      <div className="aula-main-wrapper">
        
        <button onClick={() => navigate(-1)} className="btn-volver">
          <ArrowLeft size={16} /> Volver al curso
        </button>

        <div className="tarea-header">
          <FileText size={32} color="#e83e8c" />
          <h1 className="tarea-titulo">{tarea?.titulo}</h1>
        </div>

        <div className="tarea-descripcion">
          {tarea?.descripcion ? (
            <p>{tarea.descripcion}</p>
          ) : (
            <p className="descripcion-vacia">Sin instrucciones adicionales.</p>
          )}
        </div>

        {/* Botones de acción arriba de la tabla */}
        <div className="acciones-container">
          {entrega ? (
            <>
              {/* EDITAR */}
              <button className={`btn-secundario ${subiendo ? 'btn-deshabilitado' : ''}`}>
                {subiendo ? 'Cargando...' : 'Editar entrega'}
                <input type="file" accept=".pdf" onChange={handleSubirArchivo} style={{ display: 'none' }} disabled={subiendo} />
              </button>

              {/* BORRAR */}
              <button 
                onClick={handleBorrarEntrega}
                disabled={subiendo}
                className={`btn-secundario ${subiendo ? 'btn-deshabilitado' : ''}`}
              >
                Borrar entrega
              </button>
            </>
          ) : (
            <label className={`btn-primario ${subiendo ? 'btn-deshabilitado' : ''}`}>
              {subiendo ? <Loader size={18} className="animate-spin" /> : 'Agregar entrega'}
              <input type="file" accept=".pdf" onChange={handleSubirArchivo} style={{ display: 'none' }} disabled={subiendo} />
            </label>
          )}
        </div>

        <h3 className="estado-titulo">Estado de la entrega</h3>
        
        <table className="tabla-estado">
          <tbody>
            <tr>
              <td className="td-etiqueta">Número del intento</td>
              <td>Este es el intento 1.</td>
            </tr>
            <tr>
              <td className="td-etiqueta">Estado de la entrega</td>
              <td className={entrega ? 'bg-entregado' : ''}>
                {entrega ? 'Enviado para calificar' : 'No entregado'}
              </td>
            </tr>
            <tr>
              <td className="td-etiqueta">Estado de la calificación</td>
              <td>{entrega?.calificacion ? `Calificado` : 'Sin calificar'}</td>
            </tr>
            <tr>
              <td className="td-etiqueta">Tiempo restante</td>
              <td className={entrega ? 'bg-entregado' : ''}>
                {entrega ? 'La tarea fue enviada antes de la fecha límite' : 'Calculando tiempo...'}
              </td>
            </tr>
            <tr>
              <td className="td-etiqueta">Última modificación</td>
              <td>
                {entrega ? new Date(entrega.entregado_en).toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
              </td>
            </tr>
            
            {entrega && (
              <tr>
                <td className="td-etiqueta">Archivos enviados</td>
                <td>
                  <div className="archivo-container">
                    <div className="archivo-info">
                      <FileText size={18} color="#dc3545" />
                      <a href="#" className="archivo-link">Archivo_Enviado.pdf</a>
                    </div>
                    <span className="archivo-fecha">
                      {new Date(entrega.entregado_en).toLocaleString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

      </div>
    </div>
  );  
};

export default DetalleTarea;