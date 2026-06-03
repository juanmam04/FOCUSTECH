import { Link } from 'react-router-dom';
import AdminGate from './AdminGate';
import Logo from './Logo';
import './Footer.css';

export default function Footer() {
  return (
    <footer id="contacto" className="footer">
      <div className="container footer__top">
        <div className="footer__brand-block">
          <Link to="/" className="footer__logo">
            <Logo size={32} />
            <span>Focus Tech</span>
          </Link>
          <AdminGate className="footer__gate footer__gate--brand" />
          <p className="footer__tagline">
            Tecnología seleccionada con envío a todo Uruguay.
          </p>
        </div>
        <div className="footer__cols">
          <div>
            <p className="footer__label">Tienda</p>
            <Link to="/productos">Productos</Link>
            <Link to="/#categorias">Categorías</Link>
            <Link to="/carrito">Carrito</Link>
          </div>
          <div>
            <p className="footer__label">Contacto</p>
            <a href="mailto:info@focustech.com">info@focustech.com</a>
            <span>Montevideo, Uruguay</span>
            <span>Lun – Vie · 10:00 – 19:00</span>
          </div>
        </div>
      </div>
      <div className="container footer__bottom">
        <p>© {new Date().getFullYear()} Focus Tech</p>
        <AdminGate className="footer__gate" />
      </div>
    </footer>
  );
}
