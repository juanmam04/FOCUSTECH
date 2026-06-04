import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InteractiveBackground from '../components/InteractiveBackground';
import Logo from '../components/Logo';
import Alert from '../components/Alert';
import GoogleSignIn from '../components/GoogleSignIn';
import ThemeToggle from '../components/ThemeToggle';
import './Login.css';

export default function Register() {
  const { user, register, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await register(name, email, password);
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.[0]?.msg
        || 'No se pudo crear la cuenta';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <InteractiveBackground />
      <div className="login-page__theme">
        <ThemeToggle />
      </div>
      <div className="login-card animate-in">
        <Link to="/" className="login-card__brand">
          <Logo size={32} />
          Focus Tech
        </Link>
        <h1 className="display">Crear cuenta</h1>
        <p className="login-card__sub">
          Registrate gratis para comprar más rápido y seguir tus pedidos.
        </p>

        {error && <Alert variant="error">{error}</Alert>}

        <GoogleSignIn redirectTo="/" disabled={submitting} onError={setError} />

        <p className="login-divider">o con email</p>

        <form onSubmit={handleSubmit} className="login-card__form">
          <div className="form-group">
            <label className="label" htmlFor="name">Nombre</label>
            <input
              id="name"
              className="input"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="form-hint">Mínimo 8 caracteres.</p>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Creando cuenta…' : 'Registrarme'}
          </button>
        </form>

        <p className="login-card__switch">
          ¿Ya tenés cuenta? <Link to="/acceso">Iniciar sesión</Link>
        </p>

        <Link to="/" className="login-card__back">← Volver a la tienda</Link>
      </div>
    </div>
  );
}
