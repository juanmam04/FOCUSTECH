import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import Alert from '../components/Alert';
import ProductCard from '../components/ProductCard';
import './Catalog.css';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get('/products', {
        params: {
          category: category || undefined,
          search: search || undefined,
          sort,
        },
      })
      .then((res) => setProducts(res.data.data))
      .catch(() => setError('No pudimos cargar el catálogo.'))
      .finally(() => setLoading(false));
  }, [category, search, sort]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="page catalog">
      <div className="container">
        <header className="catalog__head section-head animate-in">
          <p className="eyebrow">Catálogo</p>
          <h1>Productos</h1>
          <p>Accesorios y tecnología premium para tu día a día.</p>
        </header>

        <div className="catalog__toolbar animate-in">
          <div className="catalog__search-wrap">
            <input
              type="search"
              className="input catalog__search"
              placeholder="Buscar productos..."
              defaultValue={search}
              onKeyDown={(e) => {
                if (e.key === 'Enter') updateParam('search', e.target.value.trim());
              }}
            />
          </div>
          <select
            className="select"
            value={category}
            onChange={(e) => updateParam('category', e.target.value)}
            aria-label="Categoría"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <select
            className="select"
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            aria-label="Ordenar"
          >
            <option value="newest">Más recientes</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
          </select>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <p className="catalog__empty">No hay productos con estos filtros.</p>
        ) : (
          <>
            <p className="catalog__count">{products.length} productos</p>
            <div className="grid-products">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
