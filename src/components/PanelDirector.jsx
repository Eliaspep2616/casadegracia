import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Plus, Users, Calendar, Settings, FileSpreadsheet, Upload, AlertCircle } from 'lucide-react';
import './PanelDirector.css';

const PanelDirector = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Datos de la base
  const [materias, setMaterias] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [niveles, setNiveles] = useState([]); // <-- NUEVO: Para cargar los grados/cursos
  
  // Estados Modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formMateria, setFormMateria] = useState({
    nombre_materia: '',
    profesor_id: '',
    nivel_id: '', // <-- NUEVO: Nivel asignado
    fecha_cierre_notas: ''
  });

  // Estados para Subida de Alumnos
  const [modalAlumnosAbierto, setModalAlumnosAbierto] = useState(false);
  const [materiaActual, setMateriaActual] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState('');

  const verificarSeguridadYCargarDatos = async () => {
    setLoading(true);

    // 1. BARRERA DE SEGURIDAD: Verificar sesión y rol
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/login');
      return;
    }

    const { data: perfilUsuario } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', session.user.id)
      .single();

    // Si no es director (o admin), lo pateamos de la pantalla
    if (perfilUsuario?.rol !== 'director' && perfilUsuario?.rol !== 'admin') {
      alert("🔒 Acceso Denegado: Esta área es solo para la Administración Central.");
      navigate('/');
      return;
    }

    // 2. CARGAR DATOS SI PASÓ LA SEGURIDAD
    // Cargar materias
    const { data: matData } = await supabase
      .from('materias')
      .select(`
        id, nombre_materia, fecha_cierre_notas, nivel_id,
        profesor:perfiles!materias_profesor_id_fkey(id, nombre_completo)
      `)
      .order('nombre_materia', { ascending: true });
    if (matData) setMaterias(matData);

    // Cargar profesores
    const { data: profData } = await supabase
      .from('perfiles')
      .select('id, nombre_completo')
      .eq('rol', 'profesor');
    if (profData) setProfesores(profData);

    // Cargar niveles (Grados/Cursos)
    const { data: nivData } = await supabase
      .from('niveles')
      .select('id, nombre_nivel');
    if (nivData) setNiveles(nivData);

    setLoading(false);
  };

  useEffect(() => { 
    verificarSeguridadYCargarDatos(); 
  }, []);

  const handleGuardarMateria = async (e) => {
    e.preventDefault();
    
    if (!formMateria.nivel_id) {
      alert("Por favor, selecciona un Nivel/Grado para esta materia.");
      return;
    }

    const datosGuardar = {
      nombre_materia: formMateria.nombre_materia,
      profesor_id: formMateria.profesor_id || null,
      nivel_id: formMateria.nivel_id, // <-- AHORA ES DINÁMICO, NO QUEMADO
      fecha_cierre_notas: formMateria.fecha_cierre_notas || null,
    };

    let errorDB = null;

    if (editandoId) {
      const { error } = await supabase.from('materias').update(datosGuardar).eq('id', editandoId);
      errorDB = error;
    } else {
      const { error } = await supabase.from('materias').insert([datosGuardar]);
      errorDB = error;
    }

    // SI HAY ERROR EN LA BASE DE DATOS, NOS AVISA
    if (errorDB) {
      console.error(errorDB);
      alert(`Error al guardar: ${errorDB.message}`);
      return;
    }

    cerrarModal();
    verificarSeguridadYCargarDatos();
  };

  // --- LÓGICA DE SUBIDA MASIVA DE ALUMNOS ---
  const abrirModalAlumnos = (materia) => {
    setMateriaActual(materia);
    setModalAlumnosAbierto(true);
  };

  const procesarCSV = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    setSubiendo(true);
    setProgreso('Leyendo archivo...');

    const lector = new FileReader();
    lector.onload = async (evento) => {
      const texto = evento.target.result;
      const filas = texto.split('\n');
      let creados = 0;

      for (let i = 1; i < filas.length; i++) {
        const fila = filas[i].trim();
        if (!fila) continue;

        const [cedula, nombreCompleto] = fila.split(',');

        if (cedula && nombreCompleto) {
          setProgreso(`Creando cuenta para: ${nombreCompleto}...`);
          
          const cedulaLimpia = cedula.trim();
          const correoFantasma = `${cedulaLimpia}@ugcampus.edu.ec`;
          const clave = cedulaLimpia; 

          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: correoFantasma,
            password: clave,
            options: { autoSignIn: false } 
          });

          if (authData?.user) {
            await supabase.from('perfiles').update({
              nombre_completo: nombreCompleto.trim(),
              cedula: cedulaLimpia,
              rol: 'estudiante'
            }).eq('id', authData.user.id);

            await supabase.from('matriculas').insert([{
              estudiante_id: authData.user.id,
              nivel_id: materiaActual.nivel_id,
              estado: 'activo'
            }]);

            creados++;
          }
        }
      }

      setProgreso(`¡Éxito! Se matricularon ${creados} alumnos correctamente.`);
      setTimeout(() => {
        setSubiendo(false);
        setModalAlumnosAbierto(false);
        setProgreso('');
      }, 3000);
    };
    
    lector.readAsText(archivo);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setFormMateria({ nombre_materia: '', profesor_id: '', nivel_id: '', fecha_cierre_notas: '' });
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Montserrat' }}>Cargando Panel del Director...</div>;

  return (
    <div className="director-panel-container">
      <div className="director-panel-wrapper">
        
        <div className="director-header-dark">
          <div>
            <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#94a3b8', letterSpacing: '2px', fontWeight: '700' }}>ADMINISTRACIÓN CENTRAL</p>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900' }}>Gestión de Módulos</h1>
          </div>
          <button onClick={() => setModalAbierto(true)} className="btn-crear-modulo">
            <Plus size={20} /> CREAR NUEVO MÓDULO
          </button>
        </div>

        <div className="director-grid">
          {materias.map(materia => (
            <div key={materia.id} className="modulo-card">
              <h2 className="modulo-titulo">{materia.nombre_materia}</h2>
              
              <div className="modulo-info">
                <div className="modulo-badge-profesor">
                  <Users size={16} /> 
                  {materia.profesor ? materia.profesor.nombre_completo : 'Sin profesor asignado'}
                </div>
                
                <div className="modulo-badge-fecha" style={{ backgroundColor: materia.fecha_cierre_notas ? '#fff1f2' : '#f1f5f9', color: materia.fecha_cierre_notas ? '#e11d48' : '#64748b' }}>
                  <Calendar size={16} />
                  {materia.fecha_cierre_notas 
                    ? `Cierre: ${new Date(materia.fecha_cierre_notas).toLocaleDateString()}` 
                    : 'Sin límite de notas'}
                </div>
              </div>

              <div className="modulo-actions">
                <button onClick={() => {
                  setEditandoId(materia.id);
                  setFormMateria({
                    nombre_materia: materia.nombre_materia,
                    profesor_id: materia.profesor?.id || '',
                    nivel_id: materia.nivel_id || '',
                    fecha_cierre_notas: materia.fecha_cierre_notas ? new Date(materia.fecha_cierre_notas).toISOString().slice(0, 16) : ''
                  });
                  setModalAbierto(true);
                }} className="btn-outline-action">
                  <Settings size={16} /> Configurar
                </button>
                
                <button className="btn-outline-action" onClick={() => abrirModalAlumnos(materia)} style={{ color: '#16a34a', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}>
                  <FileSpreadsheet size={16} /> Alumnos
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* MODAL CONFIGURACIÓN MÓDULO */}
      {modalAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '20px', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ marginTop: 0, color: '#1e293b' }}>{editandoId ? 'Configurar Módulo' : 'Crear Nuevo Módulo'}</h2>
            
            <form onSubmit={handleGuardarMateria}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Nombre de la Clase</label>
                <input required type="text" value={formMateria.nombre_materia} onChange={e => setFormMateria({...formMateria, nombre_materia: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Ej: Programación Avanzada" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Nivel / Grado</label>
                  <select required value={formMateria.nivel_id} onChange={e => setFormMateria({...formMateria, nivel_id: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                    <option value="">Seleccionar...</option>
                    {niveles.map(niv => (
                      <option key={niv.id} value={niv.id}>{niv.nombre_nivel}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Asignar Profesor</label>
                  <select value={formMateria.profesor_id} onChange={e => setFormMateria({...formMateria, profesor_id: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                    <option value="">Ninguno</option>
                    {profesores.map(prof => (
                      <option key={prof.id} value={prof.id}>{prof.nombre_completo}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Cierre de Actas (Límite para notas)</label>
                <input type="datetime-local" value={formMateria.fecha_cierre_notas} onChange={e => setFormMateria({...formMateria, fecha_cierre_notas: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Después de esta fecha, el profesor no podrá modificar calificaciones.</span>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button type="button" onClick={cerrarModal} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#0f172a', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Guardar Módulo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SUBIR ALUMNOS (Sin cambios) */}
      {modalAlumnosAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '20px', width: '90%', maxWidth: '500px', textAlign: 'center' }}>
            <h2 style={{ marginTop: 0, color: '#1e293b' }}>Subir Alumnos a {materiaActual?.nombre_materia}</h2>
            
            <div style={{ backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '12px', marginBottom: '25px', textAlign: 'left' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertCircle size={18} color="#0284c7" /> Formato requerido (CSV)
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>Crea un archivo de Excel, pon solo dos columnas separadas por coma y guárdalo como <strong>"CSV (delimitado por comas)"</strong>.</p>
              <pre style={{ backgroundColor: '#e2e8f0', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginTop: '10px' }}>
                Cedula,Nombre Completo<br/>
                0912345678,Juan Perez<br/>
                0987654321,Maria Gomez
              </pre>
            </div>

            {subiendo ? (
              <div style={{ padding: '30px 0' }}>
                <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', marginBottom: '15px' }}>⏳</div>
                <p style={{ fontWeight: 'bold', color: '#0284c7' }}>{progreso}</p>
              </div>
            ) : (
              <div>
                <label style={{ display: 'inline-block', backgroundColor: '#16a34a', color: 'white', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}>
                  <Upload size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Seleccionar Archivo CSV
                  <input type="file" accept=".csv" onChange={procesarCSV} style={{ display: 'none' }} />
                </label>
                
                <div>
                  <button onClick={() => setModalAlumnosAbierto(false)} style={{ padding: '10px 20px', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelDirector;