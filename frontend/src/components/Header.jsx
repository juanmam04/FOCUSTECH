import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import './Header.css';

const PUBLIC_NAV = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/productos', label: 'Productos' },
  { to: '/#categorias', label: 'Categorías' },
  { to: '/#envios', label: 'Envíos' },
  { to: '/#contacto', label: 'Contacto' },
];

function HeaderAuth({ onNavigate, className = '' }) {
  const { user, loading, logout, isAdmin } = useAuth();

  if (loading) return null;

  if (isAdmin) {
    return (
      <Link
        to="/panel"
        className={`header__auth header__auth--panel ${className}`.trim()}
        onClick={onNavigate}
      >
        Panel
      </Link>
    );
  }

  if (user) {
    return (
      <div className={`header__auth-group ${className}`.trim()}>
        <span className="header__auth-user">Hola, {user.name.split(' ')[0]}</span>
        <button type="button" className="header__auth header__auth--ghost" onClick={() => { logout(); onNavigate?.(); }}>
          Salir
        </button>
      </div>
    );
  }

  return (
    <div className={`header__auth-group ${className}`.trim()}>
      <Link to="/registro" className="header__auth header__auth--ghost" onClick={onNavigate}>
        Registrarse
      </Link>
      <Link to="/acceso" className="header__auth header__auth--login" onClick={onNavigate}>
        Iniciar sesión
      </Link>
    </div>
  );
}

export default function Header() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo" onClick={closeMenu}>
          <Logo size={38} />
          <span className="header__logo-text">
            <span className="header__logo-name">Focus Tech</span>
            <span className="header__logo-tag">Store</span>
          </span>
        </Link>

        <button
          type="button"
          className="header__menu-btn"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
        </button>

        <nav className={`header__nav ${menuOpen ? 'is-open' : ''}`}>
          {PUBLIC_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
          <div className="header__nav-auth">
            <HeaderAuth onNavigate={closeMenu} />
          </div>
        </nav>

        <div className="header__actions">
          <HeaderAuth className="header__actions-auth" />
          <ThemeToggle className="header__theme" />
          <Link
            to="/carrito"
            className="header__cart"
            aria-label={`Carrito${itemCount > 0 ? `, ${itemCount} productos` : ''}`}
            onClick={closeMenu}
          >
            <span className="header__cart-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6h14l-1.5 9h-12L6 6z" strokeLinejoin="round" />
                <circle cx="9" cy="20" r="1.25" fill="currentColor" stroke="none" />
                <circle cx="18" cy="20" r="1.25" fill="currentColor" stroke="none" />
                <path d="M6 6L5 3H2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="header__cart-label">Carrito</span>
            {itemCount > 0 && (
              <span className="header__cart-count">{itemCount}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
