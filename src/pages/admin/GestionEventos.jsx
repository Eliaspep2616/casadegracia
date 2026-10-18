import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient.js';

const GestionEventos = () => {
  const [eventos, setEventos] = useState([]);
  const [nuevoEvento, setNuevoEvento] = useState({
    nombre: '',
    stock_maximo: 100,
    precio_unitario: 5.00,
    fecha_evento: ''
  });
  const [cargando, setCargando] = useState(false);

  // Cargar eventos
  const obtenerEventos = async () => {
    const { data, error } = await supabase.from('eventos').select('*');
    if (!error) setEventos(data);
  };

  useEffect(() => {
    obtenerEventos();
  }, []);

  // Crear evento
  const manejarCrearEvento = async (e) => {
    e.preventDefault();
    setCargando(true);
    const { error } = await supabase.from('eventos').insert([{
      ...nuevoEvento,
      stock_disponible: nuevoEvento.stock_maximo 
    }]);

    if (!error) {
      setNuevoEvento({ nombre: '', stock_maximo: 100, precio_unitario: 5.00, fecha_evento: '' });
      obtenerEventos();
    } else {
      alert('Error al crear el evento');
    }
    setCargando(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>🛠️ CMS - Gestión de Eventos</h2>

      <form onSubmit={manejarCrearEvento} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
        <h3>Crear Nuevo Evento</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <input 
            type="text" placeholder="Nombre del Evento" required
            value={nuevoEvento.nombre}
            onChange={(e) => setNuevoEvento({...nuevoEvento, nombre: e.target.value})}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <input 
            type="datetime-local" required
            value={nuevoEvento.fecha_evento}
            onChange={(e) => setNuevoEvento({...nuevoEvento, fecha_evento: e.target.value})}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <input 
            type="number" placeholder="Stock Máximo" required
            value={nuevoEvento.stock_maximo}
            onChange={(e) => setNuevoEvento({...nuevoEvento, stock_maximo: parseInt(e.target.value) || 0})}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <input 
            type="number" step="0.01" placeholder="Precio Unitario ($)" required
            value={nuevoEvento.precio_unitario}
            onChange={(e) => setNuevoEvento({...nuevoEvento, precio_unitario: parseFloat(e.target.value) || 0})}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <button type="submit" disabled={cargando} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          {cargando ? 'Guardando...' : 'Publicar Evento'}
        </button>
      </form>

      <h3>Eventos Registrados</h3>
      <div style={{ display: 'grid', gap: '10px' }}>
        {eventos.map((ev) => (
          <div key={ev.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{ev.nombre}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Stock disponible: <b>{ev.stock_disponible}</b> / {ev.stock_maximo} | Precio: ${ev.precio_unitario}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionEventos;