/**
 * Ejemplo equivalente a page.tsx de la guía Next.js (consulta todos).
 * Usalo cuando tengas la tabla `todos` en Supabase.
 *
 * import { useSupabase } from '../../context/SupabaseProvider';
 *
 * const { supabase } = useSupabase();
 * const { data: todos } = await supabase.from('todos').select();
 */
export async function fetchTodos(supabase) {
  if (!supabase) return { data: [], error: new Error('Supabase no configurado') };
  return supabase.from('todos').select();
}
