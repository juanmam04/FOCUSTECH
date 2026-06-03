import { Link, NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PanelLayout.css';

const NAV = [
  { to: '/panel', end: true, label: 'Resumen' },
  { to: '/panel/analiticas', label: 'Analíticas' },
  { to: '/panel/productos', label: 'Productos' },
  { to: '/panel/categorias', label: 'Categorías' },
  { to: '/panel/pedidos', label: 'Pedidos' },
];

export default function PanelLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/acceso" state={{ from: { pathname: '/panel' } }} replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="panel">
      <aside className="panel__sidebar">
        <Link to="/panel" className="panel__brand">
          <span className="panel__brand-icon" aria-hidden />
          <div>
            <span className="panel__brand-name">Focus Tech</span>
            <span className="panel__brand-sub">Gestión</span>
          </div>
        </Link>

        <nav className="panel__nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'is-active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="panel__sidebar-foot">
          <Link to="/" className="panel__store-link">Ver tienda pública</Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Cerrar sesión
          </button>
          <p className="panel__user">{user.email}</p>
        </div>
      </aside>

      <main className="panel__main">
        <Outlet />
      </main>
    </div>
  );
}
