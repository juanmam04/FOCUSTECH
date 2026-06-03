import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import './Home.css';

const TRUST = [
  { title: 'Envío nacional', desc: 'Llegamos a todos los departamentos de Uruguay.' },
  { title: 'Pago seguro', desc: 'Transferencia bancaria o coordinación por WhatsApp.' },
  { title: 'Stock real', desc: 'Disponibilidad actualizada en cada compra.' },
  { title: 'Atención directa', desc: 'Te acompañamos antes y después de tu pedido.' },
];

const CATEGORY_UI = {
  auriculares: {
    label: 'Sonido premium',
    desc: 'AirPods y audio inalámbrico',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 26v6a6 6 0 0012 0v-6M10 22h4v8h-4v-8zm24 0h4v8h-4v-8z" />
      </svg>
    ),
  },
  cargadores: {
    label: 'Carga rápida',
    desc: 'Adaptadores y MagSafe',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="16" y="8" width="16" height="28" rx="3" />
        <path d="M24 36v8M20 44h8" />
      </svg>
    ),
  },
  cables: {
    label: 'Conexión confiable',
    desc: 'USB-C, Lightning y más',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 24h20M28 20v8M28 24h12" />
        <circle cx="8" cy="24" r="4" />
      </svg>
    ),
  },
  accesorios: {
    label: 'Complementos',
    desc: 'Fundas, fichas y hubs',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="10" y="14" width="28" height="20" rx="4" />
        <path d="M18 24h12" />
      </svg>
    ),
  },
};

function getCategoryUi(slug, name) {
  return CATEGORY_UI[slug] || {
    label: 'Explorar',
    desc: name,
    icon: CATEGORY_UI.accesorios.icon,
  };
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/products', { params: { featured: true, limit: 8 } }),
    ])
      .then(([catRes, featuredRes]) => {
        setCategories(catRes.data.data.slice(0, 4));
        setFeatured(featuredRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="home">
      <section className="hero">
        <div className="hero__shell">
          <div className="hero__copy animate-in">
            <p className="eyebrow">Focus Tech · Tienda oficial</p>
            <h1 className="hero__title display">
              Tu próxima compra en tecnologia, sin vueltas.
            </h1>
            <p className="hero__lead">
              Auriculares, cargadores, cables y accesorios seleccionados, con stock real y envío a todo Uruguay.
            </p>
            <div className="hero__cta">
              <Link to="/productos" className="btn btn-primary">Comprar ahora</Link>
              <Link to="/productos" className="btn btn-outline">Ver catálogo</Link>
            </div>
            <p className="hero__trust-line">
              <span>Stock disponible</span>
              <span className="hero__trust-dot" aria-hidden>·</span>
              <span>Envío a todo Uruguay</span>
              <span className="hero__trust-dot" aria-hidden>·</span>
              <span>Pago simple</span>
            </p>
          </div>
        </div>
      </section>

      <section id="categorias" className="home-categories">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Comprá por categoría</p>
            <h2>Encontrá lo que buscás</h2>
          </div>
          {loading ? (
            <div className="loading-screen"><div className="spinner" /></div>
          ) : (
            <div className="category-bento">
              {categories.map((cat, i) => {
                const ui = getCategoryUi(cat.slug, cat.name);
                return (
                  <Link
                    key={cat.id}
                    to={`/productos?category=${cat.slug}`}
                    className={`category-bento__card category-bento__card--${i + 1} animate-in`}
                    style={{ animationDelay: `${i * 90}ms` }}
                  >
                    <div className="category-bento__icon">{ui.icon}</div>
                    <div className="category-bento__content">
                      <span className="category-bento__tag">{ui.label}</span>
                      <h3>{cat.name}</h3>
                      <p>{ui.desc}</p>
                    </div>
                    <span className="category-bento__cta">
                      Explorar
                      <span aria-hidden>→</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="home-section container">
        <div className="section-head">
          <p className="eyebrow">Selección</p>
          <h2>Productos destacados</h2>
          <p>Lo más pedido por nuestros clientes.</p>
        </div>
        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : (
          <div className="grid-products">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      <section id="envios" className="trust">
        <div className="container trust__grid">
          {TRUST.map((item, i) => (
            <div key={item.title} className="trust__item animate-in" style={{ animationDelay: `${i * 70}ms` }}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
