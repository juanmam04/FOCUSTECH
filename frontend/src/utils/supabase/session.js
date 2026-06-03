/**
 * Refresco de sesión en SPA (React + Vite).
 * En Next.js esto lo hace middleware.ts; aquí se ejecuta al iniciar la app.
 */
export async function initSupabaseSession(supabase, onSessionChange) {
  if (!supabase) return () => {};

  const { data: { session } } = await supabase.auth.getSession();
  onSessionChange?.(session);

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      onSessionChange?.(session);
    }
  );

  return () => subscription.unsubscribe();
}
