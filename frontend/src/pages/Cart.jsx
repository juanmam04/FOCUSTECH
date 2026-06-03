import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { imageUrl, productPlaceholder } from '../utils/images';
import './Cart.css';

export default function Cart() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (!items.length) {
    return (
      <div className="page container">
        <div className="section-head">
          <h1>Carrito</h1>
        </div>
        <div className="cart-empty-state">
          <p>Tu carrito está vacío.</p>
          <Link to="/productos" className="btn btn-primary">Explorar productos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page container">
      <div className="section-head animate-in">
        <p className="eyebrow">Tu pedido</p>
        <h1>Carrito</h1>
      </div>

      <div className="cart-layout">
        <div>
          {items.map((item) => (
            <div key={item.product_id} className="cart-item">
              <img
                src={imageUrl(item.image) || productPlaceholder(item.name)}
                alt=""
                className="cart-item__img"
              />
              <div>
                <Link to={`/producto/${item.slug}`} className="cart-item__name">
                  {item.name}
                </Link>
                <p className="cart-item__meta">{item.category_name}</p>
                <p className="cart-item__meta">{formatPrice(item.price)} c/u</p>
              </div>
              <div className="qty-control">
                <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
              </div>
              <p className="cart-item__line-price">{formatPrice(item.price * item.quantity)}</p>
              <button
                type="button"
                className="cart-item__remove"
                onClick={() => removeItem(item.product_id)}
                aria-label="Eliminar"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h2>Resumen</h2>
          <div className="cart-summary__row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="cart-summary__total">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className="cart-summary__note">El envío se calcula en el checkout.</p>
          <Link to="/checkout" className="btn btn-primary" style={{ width: '100%' }}>
            Finalizar compra
          </Link>
        </aside>
      </div>
    </div>
  );
}
