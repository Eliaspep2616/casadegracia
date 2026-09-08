import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
// Cambia la línea de importación por esta:
import { Plus, Users, Calendar, Settings, FileSpreadsheet, Upload, AlertCircle, ExternalLink, X, LogOut } from 'lucide-react';
import './PanelDirector.css';

const PanelDirector = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Datos de la base
  const [materias, setMaterias] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [niveles, setNiveles] = useState([]); 
  
  // Estados Modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formMateria, setFormMateria] = useState({
    nombre_materia: '',
    profesor_id: '',
    nivel_id: '', 
    fecha_cierre_notas: ''
  });
const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate('/'); // Te envía al home cuando cierras sesión
  };
  // Estados para Subida de Alumnos
  const [modalAlumnosAbierto, setModalAlumnosAbierto] = useState(false);
  const [materiaActual, setMateriaActual] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState('');

  const verificarSeguridadYCargarDatos = async () => {
    setLoading(true);

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

    if (perfilUsuario?.rol !== 'director' && perfilUsuario?.rol !== 'admin') {
      alert("🔒 Acceso Denegado: Esta área es solo para la Administración Central.");
      navigate('/');
      return;
    }

    const { data: matData } = await supabase
      .from('materias')
      .select(`
        id, nombre_materia, fecha_cierre_notas, nivel_id,
        profesor:perfiles!materias_profesor_id_fkey(id, nombre_completo)
      `)
      .order('nombre_materia', { ascending: true });
    if (matData) setMaterias(matData);

    const { data: profData } = await supabase
      .from('perfiles')
      .select('id, nombre_completo')
      .eq('rol', 'profesor');
    if (profData) setProfesores(profData);

    const { data: nivData } = await supabase
      .from('niveles')
      .select('id, nombre');
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
      nivel_id: formMateria.nivel_id, 
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

    if (errorDB) {
      console.error(errorDB);
      alert(`Error al guardar: ${errorDB.message}`);
      return;
    }

    cerrarModal();
    verificarSeguridadYCargarDatos();
  };

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
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button onClick={() => setModalAbierto(true)} className="btn-crear-modulo">
              <Plus size={20} /> CREAR NUEVO MÓDULO
            </button>
            
            {/* 👇 NUEVO BOTÓN DE CERRAR SESIÓN 👇 */}
            <button 
              onClick={handleCerrarSesion} 
              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
            >
              <LogOut size={20} /> SALIR
            </button>
          </div>
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
                <button onClick={() => navigate(`/admin-clase/${materia.id}`)} className="btn-outline-action" style={{ color: '#0f6cbd', borderColor: '#bae6fd', backgroundColor: '#f0f9ff' }}>
                  <ExternalLink size={16} /> Supervisar
                </button>

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
        <div className="director-modal-overlay">
          <div className="director-modal-content">
            
            <button onClick={cerrarModal} className="btn-cerrar-modal" title="Cerrar">
              <X size={20} strokeWidth={3} />
            </button>

            <h2 className="director-modal-title" style={{ marginBottom: '25px' }}>
              {editandoId ? 'Configurar Módulo' : 'Crear Nuevo Módulo'}
            </h2>
            
            <form onSubmit={handleGuardarMateria} className="modal-form-wrapper">
              
              <div className="modal-form-group">
                <label className="modal-label">Nombre de la Clase</label>
                <input 
                  required 
                  type="text" 
                  value={formMateria.nombre_materia} 
                  onChange={e => setFormMateria({...formMateria, nombre_materia: e.target.value})} 
                  className="modal-input" 
                  placeholder="Ej: Programación Avanzada" 
                />
              </div>

              <div className="modal-grid-2col">
                <div>
                  <label className="modal-label">Nivel / Grado</label>
                  <select required value={formMateria.nivel_id} onChange={e => setFormMateria({...formMateria, nivel_id: e.target.value})} className="modal-input">
                    <option value="">Seleccionar...</option>
                    {niveles.map(niv => (
                      <option key={niv.id} value={niv.id}>{niv.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="modal-label">Asignar Profesor</label>
                  <select value={formMateria.profesor_id} onChange={e => setFormMateria({...formMateria, profesor_id: e.target.value})} className="modal-input">
                    <option value="">Ninguno</option>
                    {profesores.map(prof => (
                      <option key={prof.id} value={prof.id}>{prof.nombre_completo}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-form-group" style={{ marginBottom: '30px' }}>
                <label className="modal-label">Cierre de Actas (Límite para notas)</label>
                <input 
                  type="datetime-local" 
                  value={formMateria.fecha_cierre_notas} 
                  onChange={e => setFormMateria({...formMateria, fecha_cierre_notas: e.target.value})} 
                  className="modal-input" 
                />
                <span className="modal-help-text">Después de esta fecha, el profesor no podrá modificar calificaciones.</span>
              </div>

              <div className="modal-actions-flex">
                <button type="button" onClick={cerrarModal} className="btn-modal-cancel">Cancelar</button>
                <button type="submit" className="btn-modal-submit">Guardar Módulo</button>
              </div>
              
            </form>
          </div>
        </div>
      )}

      {/* MODAL SUBIR ALUMNOS */}
      {modalAlumnosAbierto && (
        <div className="director-modal-overlay">
          <div className="director-modal-content">
            
            <button 
              onClick={() => setModalAlumnosAbierto(false)} 
              className="btn-cerrar-modal"
              title="Cerrar"
            >
              <X size={20} strokeWidth={3} />
            </button>

            <h2 className="director-modal-title">Subir Alumnos a {materiaActual?.nombre_materia}</h2>
            
            <div className="info-box-csv">
              <p className="info-box-title">
                <AlertCircle size={18} color="#0284c7" /> Formato requerido (CSV)
              </p>
              <p className="info-box-text">Crea un archivo de Excel, pon solo dos columnas separadas por coma y guárdalo como <strong>"CSV (delimitado por comas)"</strong>.</p>
              <pre className="pre-csv-format">
                Cedula,Nombre Completo<br/>
                0912345678,Juan Perez<br/>
                0987654321,Maria Gomez
              </pre>
            </div>

            {subiendo ? (
              <div className="loading-csv-container">
                <div className="spinner-csv">⏳</div>
                <p className="progress-text-csv">{progreso}</p>
              </div>
            ) : (
              <div>
                <label className="btn-upload-csv">
                  <Upload size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Seleccionar Archivo CSV
                  <input type="file" accept=".csv" onChange={procesarCSV} style={{ display: 'none' }} />
                </label>
                
                <div>
                  <button onClick={() => setModalAlumnosAbierto(false)} className="btn-cancel-modal">Cancelar</button>
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