import { useEffect, useState } from 'react';
import { getAnalyticsSessionId } from '../utils/analyticsSession';
import { trackEvent } from '../utils/track';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Alert from '../components/Alert';
import { useCart } from '../context/CartContext';
import { DEPARTMENTS_UY, formatPrice } from '../utils/format';
import './Checkout.css';

const SHIPPING_OPTIONS = [
  { value: 'montevideo', label: 'Montevideo — Envío gratis' },
  { value: 'interior', label: 'Interior — $250' },
  { value: 'pickup', label: 'Retiro en local — Gratis' },
];

const PAYMENT_OPTIONS = [
  { value: 'transferencia', label: 'Transferencia bancaria' },
  { value: 'whatsapp', label: 'Coordinar por WhatsApp' },
];

function getShippingCost(method) {
  if (method === 'interior') return 250;
  return 0;
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    department: 'Montevideo',
    city: '',
    address: '',
    shipping_method: 'montevideo',
    payment_method: 'transferencia',
    notes: '',
  });

  useEffect(() => {
    if (items.length > 0) {
      trackEvent('begin_checkout', '/checkout', { items: items.length });
    }
  }, [items.length]);

  if (!items.length) {
    navigate('/carrito');
    return null;
  }

  const shippingCost = getShippingCost(form.shipping_method);
  const total = subtotal + shippingCost;

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/orders', {
        ...form,
        session_id: getAnalyticsSessionId(),
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      });
      const order = res.data.data;
      sessionStorage.setItem(`ft_order_${order.id}`, JSON.stringify(order));
      clearCart();
      navigate(`/pedido-confirmado/${order.id}`, { state: { order } });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container checkout-page">
      <div className="section-head animate-in">
        <p className="eyebrow">Finalizar</p>
        <h1>Checkout</h1>
      </div>
      <form onSubmit={handleSubmit} className="checkout-layout">
        <div className="checkout-form-block">
          {error && <Alert variant="error">{error}</Alert>}

          <h2>Datos de contacto</h2>
          <div className="form-group">
            <label className="label">Nombre completo</label>
            <input className="input" name="customer_name" required value={form.customer_name} onChange={handleChange} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" name="customer_email" required value={form.customer_email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="label">Teléfono</label>
              <input className="input" name="customer_phone" required value={form.customer_phone} onChange={handleChange} />
            </div>
          </div>

          <h2>Envío</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Departamento</label>
              <select className="select" name="department" value={form.department} onChange={handleChange}>
                {DEPARTMENTS_UY.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Ciudad</label>
              <input className="input" name="city" required value={form.city} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Dirección</label>
            <input className="input" name="address" required value={form.address} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="label">Método de envío</label>
            <select className="select" name="shipping_method" value={form.shipping_method} onChange={handleChange}>
              {SHIPPING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <h2>Pago</h2>
          <div className="form-group">
            <label className="label">Método de pago</label>
            <select className="select" name="payment_method" value={form.payment_method} onChange={handleChange}>
              {PAYMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Notas (opcional)</label>
            <textarea className="textarea" name="notes" rows={3} value={form.notes} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-accent" disabled={loading}>
            {loading ? 'Procesando...' : 'Confirmar pedido'}
          </button>
        </div>

        <aside className="checkout-summary">
          <h2>Tu pedido</h2>
          {items.map((item) => (
            <div key={item.product_id} className="checkout-summary__item">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="checkout-summary__row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="checkout-summary__row">
            <span>Envío</span>
            <span>{shippingCost ? formatPrice(shippingCost) : 'Gratis'}</span>
          </div>
          <div className="checkout-summary__total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </aside>
      </form>
    </div>
  );
}
