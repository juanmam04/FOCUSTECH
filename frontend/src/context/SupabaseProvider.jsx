import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createClient, isSupabaseConfigured } from '../utils/supabase/client';
import { initSupabaseSession } from '../utils/supabase/session';

const SupabaseContext = createContext({
  supabase: null,
  session: null,
  user: null,
  loading: true,
  configured: false,
});

export function SupabaseProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured());

  const supabase = useMemo(() => createClient(), []);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let unsubscribe = () => {};

    initSupabaseSession(supabase, (nextSession) => {
      setSession(nextSession);
      setLoading(false);
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => unsubscribe();
  }, [supabase]);

  const value = {
    supabase,
    session,
    user: session?.user ?? null,
    loading,
    configured,
  };

  return (
    <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>
  );
}

export function useSupabase() {
  return useContext(SupabaseContext);
}
