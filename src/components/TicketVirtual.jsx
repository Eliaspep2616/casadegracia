import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const PantallaConfirmacion = ({ ultimoRegistro, onRegistrarOtro, eventoId }) => {
  const [stock, setStock] = useState(null);

  // Suscripción en tiempo real para el contador de la iglesia
  useEffect(() => {
    const consultarStock = async () => {
      const { data } = await supabase
        .from('eventos')
        .select('stock_disponible')
        .eq('id', eventoId)
        .maybeSingle();
      if (data) setStock(data.stock_disponible);
    };

    consultarStock();

    const canal = supabase.channel('stock-iglesia')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'eventos', filter: `id=eq.${eventoId}` }, 
        (payload) => setStock(payload.new.stock_disponible)
      )
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, [eventoId]);

  return (
    <div className="card" style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '4rem' }}>✅</div>
        <h2 style={{ color: '#4ade80', marginTop: '10px' }}>¡Registro Exitoso!</h2>
        <p style={{ color: 'white', fontSize: '1.1rem' }}>
          Gracias <strong>{ultimoRegistro.nombre}</strong>, te hemos registrado correctamente.
        </p>
      </div>

      <div style={{ 
        background: 'rgba(255,255,255,0.05)', 
        padding: '15px', 
        borderRadius: '10px', 
        marginBottom: '20px' 
      }}>
        <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>Cupos restantes en la iglesia:</p>
        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
          {stock !== null ? stock : '...'}
        </span>
      </div>

      <button 
        onClick={onRegistrarOtro}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#e63946',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        ➕ Registrar a otra persona
      </button>
      
      <p style={{ marginTop: '15px', fontSize: '0.8rem', color: '#777' }}>
        Los tickets se enviarán al correo electrónico proporcionado.
      </p>
    </div>
  );
};

export default PantallaConfirmacion;