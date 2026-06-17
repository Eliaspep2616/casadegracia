import { supabase } from '../supabaseClient';

export const useGestionContenido = () => {
  
  const guardarElemento = async (tabla, datos) => {
    const { data, error } = await supabase.from(tabla).insert([datos]).select();
    if (error) throw error;
    return data;
  };

  // NUEVO: Función para actualizar un elemento existente
  const actualizarElemento = async (tabla, id, datos) => {
    const { data, error } = await supabase.from(tabla).update(datos).eq('id', id).select();
    if (error) throw error;
    return data;
  };

  const eliminarElemento = async (tabla, id) => {
    const { error } = await supabase.from(tabla).delete().eq('id', id);
    if (error) throw error;
  };

const obtenerEstructuraMateria = async (materiaId) => {
    const { data, error } = await supabase
      .from('unidades')
      .select(`
        id, titulo, orden,
        recursos(id, titulo, url, tipo),
        actividades(id, titulo, tipo, apertura, cierre, visible, descripcion, permite_atrasos) 
      `)
      .eq('materia_id', materiaId)
      .order('orden', { ascending: true });

    if (error) throw error;
    return data;
  };

  return { guardarElemento, actualizarElemento, eliminarElemento, obtenerEstructuraMateria };
};