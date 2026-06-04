import { Link } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import ProductImage from './ProductImage';
import './ProductCard.css';

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const { toast } = useAlert();
  const outOfStock = product.stock < 1;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem(product, 1);
    toast.success('Agregado al carrito', { title: product.name });
  };

  return (
    <article
      className="p-card animate-in"
      style={{ animationDelay: `${Math.min(index * 50, 250)}ms` }}
    >
      <Link to={`/producto/${product.slug}`} className="p-card__link">
        <div className="p-card__visual">
          <ProductImage
            path={product.main_image}
            name={product.name}
            categorySlug={product.category_slug}
            alt={product.name}
            loading="lazy"
          />
          {product.is_featured && <span className="p-card__flag">Destacado</span>}
          {outOfStock && <span className="p-card__flag p-card__flag--dim">Agotado</span>}
        </div>

        <div className="p-card__body">
          <span className="p-card__cat">{product.category_name}</span>
          <h3 className="p-card__title">{product.name}</h3>
          <div className="p-card__row">
            <div className="p-card__prices">
              <span className="p-card__price">{formatPrice(product.price)}</span>
              {product.compare_at_price && (
                <span className="p-card__was">{formatPrice(product.compare_at_price)}</span>
              )}
            </div>
            {!outOfStock ? (
              <button type="button" className="p-card__add" onClick={handleAdd}>
                +
              </button>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
