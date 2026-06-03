import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminGate.css';

/** Botón invisible para acceso al panel sin URL manual */
export default function AdminGate({ className = '' }) {
  const { user } = useAuth();
  const to = user?.role === 'admin' ? '/panel' : '/acceso';

  return (
    <Link
      to={to}
      className={`admin-gate ${className}`.trim()}
      aria-label="Acceso equipo"
      tabIndex={-1}
    />
  );
}
