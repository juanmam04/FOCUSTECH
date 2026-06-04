import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';
import { formatPrice } from '../utils/format';
import './Home.css';

const HERO_BENEFITS = [
  {
    title: 'Envío nacional',
    desc: 'A todos los departamentos.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M3 9h13v10H3V9zM16 12h4l1 3v4h-5v-7z" />
      </svg>
    ),
  },
  {
    title: 'Pago simple',
    desc: 'Transferencia o WhatsApp.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    title: 'Stock real',
    desc: 'Disponibilidad al día.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M9 12l2 2 4-4M12 3l7 3v5c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3z" />
      </svg>
    ),
  },
];

const CATEGORY_META = {
  auriculares: { hint: 'Audio inalámbrico', icon: '🎧' },
  cargadores: { hint: 'Carga rápida', icon: '🔌' },
  cables: { hint: 'USB-C y Lightning', icon: '🔗' },
  accesorios: { hint: 'Fundas y más', icon: '📱' },
};

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  const pick = featured[0] ?? null;

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/products', { params: { featured: true, limit: 8 } }),
    ])
      .then(([catRes, productsRes]) => {
        setCategories(catRes.data.data.slice(0, 4));
        setFeatured(productsRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="home">
      <section className="hero">
        <div className="container hero__grid animate-in">
          <div className="hero__copy">
            <p className="hero__kicker">Tienda online · Uruguay</p>
            <h1>
              Tecnología y accesorios con envío a todo el{' '}
              <span className="hero__accent">país</span>.
            </h1>
            <p className="hero__lead">
              Auriculares, cargadores, cables y más. Precios claros en pesos uruguayos.
            </p>
            <div className="hero__cta">
              <Link to="/productos" className="btn btn-primary">Ver productos</Link>
              <Link to="/productos" className="btn btn-outline">Catálogo completo</Link>
            </div>

            {!loading && pick && (
              <Link to={`/producto/${pick.slug}`} className="hero__pick">
                <span className="hero__pick-img">
                  <ProductImage
                    path={pick.main_image}
                    name={pick.name}
                    categorySlug={pick.category_slug}
                    alt=""
                  />
                </span>
                <span className="hero__pick-text">
                  <span className="hero__pick-label">Destacado</span>
                  <span className="hero__pick-name">{pick.name}</span>
                  <span className="hero__pick-price">{formatPrice(pick.price)}</span>
                </span>
                <span className="hero__pick-arrow" aria-hidden>→</span>
              </Link>
            )}
          </div>

          <div className="hero__benefits">
            <p className="hero__benefits-title">Por qué comprar acá</p>
            {HERO_BENEFITS.map((item) => (
              <article key={item.title} className="hero__card">
                <span className="hero__card-icon">{item.icon}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="categorias" className="home-section">
        <div className="container">
          <header className="home-section__head">
            <div>
              <h2>Categorías</h2>
              <p className="home-section__sub">Elegí lo que necesitás</p>
            </div>
            <Link to="/productos" className="home-section__link">Ver todo →</Link>
          </header>
          {loading ? (
            <div className="home-loading"><div className="spinner" /></div>
          ) : (
            <div className="home-cats">
              {categories.map((cat) => {
                const meta = CATEGORY_META[cat.slug] || { hint: 'Ver productos', icon: '⚡' };
                return (
                  <Link
                    key={cat.id}
                    to={`/productos?category=${cat.slug}`}
                    className="home-cat"
                  >
                    <span className="home-cat__icon" aria-hidden>{meta.icon}</span>
                    <span className="home-cat__name">{cat.name}</span>
                    <span className="home-cat__hint">{meta.hint}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="home-section home-section--muted">
        <div className="container">
          <header className="home-section__head">
            <div>
              <h2>Productos destacados</h2>
              <p className="home-section__sub">Los más pedidos de la tienda</p>
            </div>
            <Link to="/productos" className="home-section__link">Ver todos →</Link>
          </header>
          {loading ? (
            <div className="home-loading"><div className="spinner" /></div>
          ) : featured.length > 0 ? (
            <div className="grid-products home-products">
              {featured.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <p className="home-empty">No hay productos destacados por ahora.</p>
          )}
        </div>
      </section>

      <section className="home-trust">
        <div className="container home-trust__inner">
          {HERO_BENEFITS.map((item) => (
            <span key={item.title}>{item.title}</span>
          ))}
          <span>Atención directa</span>
        </div>
      </section>
    </main>
  );
}
