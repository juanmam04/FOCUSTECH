import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { consumeAuthRedirect } from '../components/GoogleSignIn';
import InteractiveBackground from '../components/InteractiveBackground';
import { createClient } from '../utils/supabase/client';
import './Login.css';

function redirectAfterAuth(user, from) {
  if (user.role === 'admin') return from?.startsWith('/panel') ? from : '/panel';
  if (from && !from.startsWith('/panel')) return from;
  return '/';
}

export default function AuthCallback() {
  const { loginWithOAuth } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const supabase = createClient();
      if (!supabase) {
        setError('Supabase no está configurado.');
        return;
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setError('No se pudo completar el inicio con Google. Intentá de nuevo.');
        return;
      }

      try {
        const data = await loginWithOAuth(session.access_token);
        if (cancelled) return;
        const from = consumeAuthRedirect();
        navigate(redirectAfterAuth(data.user, from), { replace: true });
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Error al vincular tu cuenta');
        }
      }
    }

    finish();
    return () => {
      cancelled = true;
    };
  }, [loginWithOAuth, navigate]);

  return (
    <div className="login-page">
      <InteractiveBackground />
      <div className="login-card animate-in" style={{ textAlign: 'center' }}>
        {error ? (
          <>
            <Alert variant="error">{error}</Alert>
            <Link to="/acceso" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Volver a iniciar sesión
            </Link>
          </>
        ) : (
          <>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            <p className="login-card__sub" style={{ margin: 0 }}>
              Completando inicio con Google…
            </p>
          </>
        )}
      </div>
    </div>
  );
}
