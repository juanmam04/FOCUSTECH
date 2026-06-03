import { Link } from 'react-router-dom';

import { useCart } from '../context/CartContext';

import { formatPrice } from '../utils/format';

import ProductImage from './ProductImage';

import './ProductCard.css';



export default function ProductCard({ product, index = 0 }) {

  const { addItem } = useCart();
  const outOfStock = product.stock < 1;



  const handleAdd = (e) => {

    e.preventDefault();

    e.stopPropagation();

    if (!outOfStock) addItem(product, 1);

  };



  return (

    <article

      className="p-card animate-in"

      style={{ animationDelay: `${Math.min(index * 50, 250)}ms` }}

    >

      <Link to={`/producto/${product.slug}`} className="p-card__media">

        <div className="p-card__glow" aria-hidden />

        <div className="p-card__frame">

          <ProductImage path={product.main_image} name={product.name} alt={product.name} loading="lazy" />

        </div>

        {product.is_featured && <span className="p-card__badge">Top</span>}

        {outOfStock && <span className="p-card__badge p-card__badge--muted">Agotado</span>}

      </Link>



      <div className="p-card__foot">

        <div className="p-card__meta">

          <span className="p-card__cat">{product.category_name}</span>

          <Link to={`/producto/${product.slug}`} className="p-card__name">

            {product.name}

          </Link>

        </div>

        <div className="p-card__buy">

          <div className="p-card__prices">

            <span className="p-card__price">{formatPrice(product.price)}</span>

            {product.compare_at_price && (

              <span className="p-card__was">{formatPrice(product.compare_at_price)}</span>

            )}

          </div>

          {!outOfStock ? (

            <button type="button" className="p-card__cta" onClick={handleAdd}>

              Agregar

            </button>

          ) : (

            <span className="p-card__cta p-card__cta--disabled">Sin stock</span>

          )}

        </div>

      </div>

    </article>

  );

}

