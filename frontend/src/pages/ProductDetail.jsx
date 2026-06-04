import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import Alert from '../components/Alert';
import ProductCard from '../components/ProductCard';
import { useAlert } from '../context/AlertContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { imageUrl, productPlaceholder } from '../utils/images';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useAlert();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data.data);
        setRelated(res.data.related || []);
        setQty(1);
        setActiveImage(0);
      })
      .catch(() => setError('Producto no encontrado'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="page container loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page container">
        <Alert variant="error">{error}</Alert>
        <Link to="/productos" className="btn btn-outline">Volver al catálogo</Link>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images.map((i) => imageUrl(i.image_url))
    : [productPlaceholder(product.name)];

  const outOfStock = product.stock < 1;

  return (
    <div className="page container product-detail">
      <div className="pdp__grid animate-in">
        <div className="pdp__gallery">
          <div className="pdp__gallery-main">
            <img src={images[activeImage]} alt={product.name} />
          </div>
          {images.length > 1 && (
            <div className="pdp__thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={i === activeImage ? 'is-active' : ''}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp__info">
          <span className="badge badge-accent">{product.category_name}</span>
          <h1>{product.name}</h1>
          <div className="pdp__prices">
            <span className="pdp__price">{formatPrice(product.price)}</span>
            {product.compare_at_price && (
              <span className="pdp__compare">{formatPrice(product.compare_at_price)}</span>
            )}
          </div>
          <p className="pdp__stock">
            {outOfStock ? 'Sin stock' : `${product.stock} unidades disponibles`}
          </p>
          <p className="pdp__desc">{product.description}</p>

          {!outOfStock && (
            <div className="form-group">
              <label className="label">Cantidad</label>
              <div className="qty-control">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
              </div>
            </div>
          )}

          <div className="pdp__actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={outOfStock}
              onClick={() => {
                addItem(product, qty);
                toast.success('Agregado al carrito', { title: product.name });
              }}
            >
              Agregar al carrito
            </button>
            <button
              type="button"
              className="btn btn-accent"
              disabled={outOfStock}
              onClick={() => {
                addItem(product, qty);
                toast.info('Continuá con el pago', { title: 'Producto en el carrito' });
                navigate('/checkout');
              }}
            >
              Comprar ahora
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pdp__related">
          <div className="section-head">
            <h2>Relacionados</h2>
          </div>
          <div className="grid-products">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
