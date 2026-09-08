import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient.js';

const GestionHome = () => {
  const [pestanaActiva, setPestanaActiva] = useState('banners');
  
  // Estados de Banners y Reuniones
  const [elementosHome, setElementosHome] = useState([]);
  const [nuevoElemento, setNuevoElemento] = useState({ titulo: '', tag: '', descripcion: '', img: '', link: '', orden: 0 });
  const [reuniones, setReuniones] = useState([]);
  const [nuevaReunion, setNuevaReunion] = useState({ titulo: '', horario: '', img: '', clase_bg: 'bg-punto', orden: 0 });

  const [cargando, setCargando] = useState(false);
  const [subiendoImg, setSubiendoImg] = useState(false);

  // Estados de la Galería
  const [galeriaAbierta, setGaleriaAbierta] = useState(false);
  const [imagenesGaleria, setImagenesGaleria] = useState([]);
  const [destinoImagen, setDestinoImagen] = useState(null); // 'banner' o 'reunion'
  const [cargandoGaleria, setCargandoGaleria] = useState(false);

  // Cargar datos iniciales
  const obtenerDatos = async () => {
    const { data: bData } = await supabase.from('home_eventos').select('*').order('orden', { ascending: true });
    if (bData) setElementosHome(bData);

    const { data: rData } = await supabase.from('home_reuniones').select('*').order('orden', { ascending: true });
    if (rData) setReuniones(rData);
  };

  useEffect(() => { obtenerDatos(); }, []);

  // -- FUNCIÓN PARA SUBIR IMÁGENES AL STORAGE --
  const manejarSubidaImagen = async (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;

    setSubiendoImg(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `home/${fileName}`; 

    const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, file);

    if (uploadError) {
      alert('Error al subir imagen: ' + uploadError.message);
      setSubiendoImg(false);
      return;
    }

    const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
    
    if (tipo === 'banner') setNuevoElemento({ ...nuevoElemento, img: data.publicUrl });
    else setNuevaReunion({ ...nuevaReunion, img: data.publicUrl });
    
    setSubiendoImg(false);
  };

  // -- LÓGICA DE LA GALERÍA VISUAL --
  const abrirGaleria = async (destino) => {
    setDestinoImagen(destino);
    setGaleriaAbierta(true);
    setCargandoGaleria(true);

    // Buscar en la raíz y en la carpeta home
    const { data: rootData } = await supabase.storage.from('assets').list('', { limit: 100 });
    const { data: homeData } = await supabase.storage.from('assets').list('home', { limit: 100 });

    let imgs = [];
    const esImagen = (nombre) => nombre.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);

    if (rootData) {
      rootData.forEach(file => {
        if (esImagen(file.name)) {
          const { data } = supabase.storage.from('assets').getPublicUrl(file.name);
          imgs.push({ id: file.id, name: file.name, url: data.publicUrl });
        }
      });
    }

    if (homeData) {
      homeData.forEach(file => {
        if (esImagen(file.name)) {
          const { data } = supabase.storage.from('assets').getPublicUrl(`home/${file.name}`);
          imgs.push({ id: file.id, name: file.name, url: data.publicUrl });
        }
      });
    }

    setImagenesGaleria(imgs);
    setCargandoGaleria(false);
  };

  const seleccionarImagen = (url) => {
    if (destinoImagen === 'banner') setNuevoElemento({ ...nuevoElemento, img: url });
    else setNuevaReunion({ ...nuevaReunion, img: url });
    setGaleriaAbierta(false);
  };

  // -- LÓGICA DE CREACIÓN / ELIMINACIÓN --
  const crearBanner = async (e) => {
    e.preventDefault();
    setCargando(true);
    const { error } = await supabase.from('home_eventos').insert([nuevoElemento]);
    if (!error) { setNuevoElemento({ titulo: '', tag: '', descripcion: '', img: '', link: '', orden: 0 }); obtenerDatos(); }
    setCargando(false);
  };

  const eliminarBanner = async (id) => {
    if(window.confirm('¿Eliminar este banner del Home?')) {
      await supabase.from('home_eventos').delete().eq('id', id);
      obtenerDatos();
    }
  };

  const crearReunion = async (e) => {
    e.preventDefault();
    setCargando(true);
    const { error } = await supabase.from('home_reuniones').insert([nuevaReunion]);
    if (!error) { setNuevaReunion({ titulo: '', horario: '', img: '', clase_bg: 'bg-punto', orden: 0 }); obtenerDatos(); }
    setCargando(false);
  };

  const eliminarReunion = async (id) => {
    if(window.confirm('¿Eliminar esta reunión del Home?')) {
      await supabase.from('home_reuniones').delete().eq('id', id);
      obtenerDatos();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
      <h2>🏠 CMS - Contenido del Home</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button onClick={() => setPestanaActiva('banners')} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: pestanaActiva === 'banners' ? '#1e293b' : '#e2e8f0', color: pestanaActiva === 'banners' ? 'white' : '#000' }}>
          🖼️ Banners (Slider)
        </button>
        <button onClick={() => setPestanaActiva('reuniones')} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: pestanaActiva === 'reuniones' ? '#1e293b' : '#e2e8f0', color: pestanaActiva === 'reuniones' ? 'white' : '#000' }}>
          🗓️ Tarjetas de Reuniones
        </button>
      </div>

      {/* --- PESTAÑA BANNERS --- */}
      {pestanaActiva === 'banners' && (
        <>
          <form onSubmit={crearBanner} style={{ background: 'white', padding: '25px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
            <h3>Agregar Banner al Slider</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <input type="text" placeholder="Título Principal" required value={nuevoElemento.titulo} onChange={(e) => setNuevoElemento({...nuevoElemento, titulo: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              <input type="text" placeholder="Etiqueta (Ej: CAMPAMENTO)" value={nuevoElemento.tag} onChange={(e) => setNuevoElemento({...nuevoElemento, tag: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              <input type="text" placeholder="Descripción corta" value={nuevoElemento.descripcion} onChange={(e) => setNuevoElemento({...nuevoElemento, descripcion: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', gridColumn: 'span 2' }} />
              
              {/* CONTENEDOR DE IMAGEN MULTIPLE OPCIÓN */}
              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Imagen de Fondo</label>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="file" accept="image/*" onChange={(e) => manejarSubidaImagen(e, 'banner')} />
                  <span style={{ fontWeight: 'bold', color: '#94a3b8' }}>O</span>
                  <button type="button" onClick={() => abrirGaleria('banner')} style={{ background: '#1e293b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    🖼️ Seleccionar de la Galería
                  </button>
                </div>
                {subiendoImg && <span style={{ color: '#2563eb', fontSize: '0.85rem' }}>Subiendo archivo...</span>}
                <input type="text" placeholder="URL de la Imagen (Se llena solo)" required value={nuevoElemento.img} onChange={(e) => setNuevoElemento({...nuevoElemento, img: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '10px' }} />
              </div>
              
              <input type="text" placeholder="Link del botón (Opcional)" value={nuevoElemento.link} onChange={(e) => setNuevoElemento({...nuevoElemento, link: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', gridColumn: 'span 2' }} />
            </div>
            <button type="submit" disabled={cargando || subiendoImg} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{cargando ? 'Guardando...' : 'Publicar Banner'}</button>
          </form>

          {/* Lista de Banners */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {elementosHome.map((item) => (
              <div key={item.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <img src={item.img} alt="" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div><strong>{item.titulo}</strong><p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{item.descripcion}</p></div>
                </div>
                <button onClick={() => eliminarBanner(item.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Quitar</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* --- PESTAÑA REUNIONES --- */}
      {pestanaActiva === 'reuniones' && (
        <>
          <form onSubmit={crearReunion} style={{ background: 'white', padding: '25px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
            <h3>Agregar Nueva Tarjeta de Reunión</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <input type="text" placeholder="Título" required value={nuevaReunion.titulo} onChange={(e) => setNuevaReunion({...nuevaReunion, titulo: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              <input type="text" placeholder="Horario" required value={nuevaReunion.horario} onChange={(e) => setNuevaReunion({...nuevaReunion, horario: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              
              {/* CONTENEDOR DE IMAGEN MULTIPLE OPCIÓN */}
              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Imagen de la Tarjeta</label>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="file" accept="image/*" onChange={(e) => manejarSubidaImagen(e, 'reunion')} />
                  <span style={{ fontWeight: 'bold', color: '#94a3b8' }}>O</span>
                  <button type="button" onClick={() => abrirGaleria('reunion')} style={{ background: '#1e293b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    🖼️ Seleccionar de la Galería
                  </button>
                </div>
                {subiendoImg && <span style={{ color: '#2563eb', fontSize: '0.85rem' }}>Subiendo archivo...</span>}
                <input type="text" placeholder="URL de la Imagen" required value={nuevaReunion.img} onChange={(e) => setNuevaReunion({...nuevaReunion, img: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '10px' }} />
              </div>
              
              <select value={nuevaReunion.clase_bg} onChange={(e) => setNuevaReunion({...nuevaReunion, clase_bg: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', gridColumn: 'span 2' }}>
                <option value="bg-punto">Fondo Rojo (Punto)</option>
                <option value="bg-kids">Fondo Naranja (Kids)</option>
                <option value="bg-getup">Fondo Verde (Getup)</option>
                <option value="bg-central">Fondo Oscuro (Central)</option>
              </select>
            </div>
            <button type="submit" disabled={cargando || subiendoImg} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{cargando ? 'Guardando...' : 'Publicar Reunión'}</button>
          </form>

          {/* Lista de Reuniones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reuniones.map((reu) => (
              <div key={reu.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <img src={reu.img} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div><strong>{reu.titulo}</strong><p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{reu.horario}</p></div>
                </div>
                <button onClick={() => eliminarReunion(reu.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Quitar</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* --- MODAL DE LA GALERÍA --- */}
      {galeriaAbierta && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '100%', maxWidth: '900px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Galería del Servidor</h3>
              <button onClick={() => setGaleriaAbierta(false)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Cerrar ✕
              </button>
            </div>
            
            {cargandoGaleria ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>Cargando imágenes...</p>
            ) : imagenesGaleria.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>No se encontraron imágenes en el servidor.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px' }}>
                {imagenesGaleria.map((img, i) => (
                  <div 
                    key={i} 
                    onClick={() => seleccionarImagen(img.url)} 
                    style={{ cursor: 'pointer', border: '2px solid transparent', borderRadius: '10px', overflow: 'hidden', background: '#f8fafc', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} 
                    onMouseOver={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.transform = 'scale(1.03)'; }} 
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <img src={img.url} alt={img.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                    <p style={{ fontSize: '0.75rem', margin: '0', padding: '8px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#334155' }}>
                      {img.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionHome;