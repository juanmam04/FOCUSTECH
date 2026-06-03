import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let browserClient = null;

/**
 * Cliente Supabase para el navegador (React + Vite).
 * Equivalente a utils/supabase/client.ts de la guía Next.js.
 */
export function createClient() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      'Supabase: faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en frontend/.env.local'
    );
  }

  if (!browserClient && supabaseUrl && supabaseKey) {
    browserClient = createBrowserClient(supabaseUrl, supabaseKey);
  }

  return browserClient;
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseKey);
}
