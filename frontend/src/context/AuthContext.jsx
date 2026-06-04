import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/client';
import { clearAuthToken, getAuthToken, setAuthToken } from '../utils/authToken';
import { createClient } from '../utils/supabase/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        clearAuthToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (data) => {
    setAuthToken(data.token);
    setUser(data.user);
    return data;
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return persistSession(res.data);
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return persistSession(res.data);
  };

  const loginWithOAuth = useCallback(async (accessToken) => {
    const res = await api.post('/auth/oauth', { access_token: accessToken });
    return persistSession(res.data);
  }, []);

  const logout = useCallback(async () => {
    clearAuthToken();
    setUser(null);
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        /* ignore */
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithOAuth,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
