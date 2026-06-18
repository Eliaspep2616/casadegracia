import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, PlusCircle, CheckCircle } from 'lucide-react';
import './EditorExamen.css'; 

const EditorExamen = () => {
  const { actividadId } = useParams();
  const navigate = useNavigate();
  
  const [examen, setExamen] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  
  // Estados para el formulario de la nueva pregunta
  const [nuevaPregunta, setNuevaPregunta] = useState('');
  const [opciones, setOpciones] = useState(['', '', '', '']); // 4 opciones por defecto
  const [indiceCorrecta, setIndiceCorrecta] = useState(0); // Por defecto la opción 1 es la correcta
  const [guardando, setGuardando] = useState(false);

  // --- LÓGICA: CARGAR PREGUNTAS ---
  const cargarExamen = async () => {
    const { data: actData } = await supabase.from('actividades').select('*').eq('id', actividadId).single();
    if (actData) setExamen(actData);

    const { data: pregData } = await supabase
      .from('examen_preguntas')
      .select(`
        id, pregunta, puntaje, orden,
        opciones:examen_opciones(id, texto_opcion, es_correcta)
      `)
      .eq('actividad_id', actividadId)
      .order('orden', { ascending: true });
      
    if (pregData) setPreguntas(pregData);
  };

  useEffect(() => { cargarExamen(); }, [actividadId]);

  // --- LÓGICA: GUARDAR NUEVA PREGUNTA ---
  const handleActualizarOpcion = (index, valor) => {
    const nuevasOpciones = [...opciones];
    nuevasOpciones[index] = valor;
    setOpciones(nuevasOpciones);
  };

  const handleGuardarPregunta = async (e) => {
    e.preventDefault();
    if (!nuevaPregunta.trim() || opciones.some(opt => !opt.trim())) {
      alert("Por favor, llena la pregunta y las 4 opciones.");
      return;
    }
    
    setGuardando(true);
    
    // 1. Guardar la pregunta
    const { data: pregGuardada, error: errPregunta } = await supabase
      .from('examen_preguntas')
      .insert([{ 
        actividad_id: actividadId, 
        pregunta: nuevaPregunta, 
        orden: preguntas.length + 1 
      }])
      .select()
      .single();

    if (errPregunta) {
      alert("Error guardando pregunta");
      setGuardando(false);
      return;
    }

    // 2. Guardar las 4 opciones asociadas
    const opcionesParaGuardar = opciones.map((texto, i) => ({
      pregunta_id: pregGuardada.id,
      texto_opcion: texto,
      es_correcta: i === indiceCorrecta
    }));

    await supabase.from('examen_opciones').insert(opcionesParaGuardar);

    // 3. Limpiar formulario y recargar la lista
    setNuevaPregunta('');
    setOpciones(['', '', '', '']);
    setIndiceCorrecta(0);
    setGuardando(false);
    cargarExamen();
  };

  return (
    <div className="examen-editor-container">
      <div className="examen-editor-wrapper">
        
        <button onClick={() => navigate(-1)} className="btn-volver">
          <ArrowLeft size={16} /> Volver a planificación
        </button>

        <h1 className="examen-editor-title">Editor de Examen: {examen?.titulo}</h1>
        <p className="examen-editor-subtitle">Agrega las preguntas de opción múltiple para esta evaluación.</p>

        {/* LISTA DE PREGUNTAS EXISTENTES */}
        <div style={{ marginBottom: '40px' }}>
          <h3 className="examen-section-title">Preguntas Guardadas ({preguntas.length})</h3>
          {preguntas.length === 0 ? (
            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', textAlign: 'center', color: '#6c757d', borderRadius: '6px' }}>
              Aún no hay preguntas. ¡Crea la primera abajo!
            </div>
          ) : (
            <div className="preguntas-lista">
              {preguntas.map((p, i) => (
                <div key={p.id} className="pregunta-card">
                  <div className="pregunta-texto">{i + 1}. {p.pregunta}</div>
                  <ul className="opciones-grid-visual">
                    {p.opciones?.map((opt) => (
                      <li key={opt.id} className={`opcion-item-visual ${opt.es_correcta ? 'correcta' : ''}`}>
                        {opt.es_correcta && <CheckCircle size={16} color="#16a34a" />}
                        {opt.texto_opcion}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FORMULARIO PARA NUEVA PREGUNTA */}
        <div className="formulario-nueva-pregunta">
          <h3 style={{ margin: '0 0 20px 0', color: '#0f6cbd', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={20}/> Añadir Nueva Pregunta
          </h3>
          
          <form onSubmit={handleGuardarPregunta}>
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label-examen">Enunciado de la pregunta:</label>
              <textarea rows="3" className="form-control" placeholder="Ej. ¿Qué es el modelo OSI?" value={nuevaPregunta} onChange={(e) => setNuevaPregunta(e.target.value)} required />
            </div>

            <label className="form-label-examen">Opciones de respuesta (Marca el círculo de la correcta):</label>
            <div className="form-opciones-grid">
              {opciones.map((opt, i) => (
                <div key={i} className="input-opcion-wrapper">
                  <input type="radio" name="opcion_correcta" className="radio-correcta" checked={indiceCorrecta === i} onChange={() => setIndiceCorrecta(i)} />
                  <input type="text" style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem' }} placeholder={`Opción ${i + 1}`} value={opt} onChange={(e) => handleActualizarOpcion(i, e.target.value)} required />
                </div>
              ))}
            </div>

            <button type="submit" disabled={guardando} className="btn-guardar-pregunta">
              {guardando ? 'Guardando...' : 'Guardar Pregunta'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default EditorExamen;