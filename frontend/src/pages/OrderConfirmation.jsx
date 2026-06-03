import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ORDER_STATUS_LABELS, formatPrice } from '../utils/format';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (order) {
      setLoading(false);
      return;
    }
    try {
      const saved = sessionStorage.getItem(`ft_order_${id}`);
      if (saved) setOrder(JSON.parse(saved));
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, [id, order]);

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '59899000000';
  const waMessage = order
    ? encodeURIComponent(
        `Hola Focus Tech, realicé el pedido ${order.order_number}. Quisiera coordinar el pago/envío.`
      )
    : '';
  const waLink = `https://wa.me/${whatsappNumber}?text=${waMessage}`;

  if (loading) {
    return (
      <div className="page container loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page container">
        <div className="alert alert-error">No se encontró el pedido.</div>
        <Link to="/" className="btn btn-outline">Ir al inicio</Link>
      </div>
    );
  }

  return (
    <div className="page container confirmation">
      <div className="confirmation__card animate-in">
        <div className="confirmation__icon">✓</div>
        <h1 className="display">Pedido confirmado</h1>
        <p className="confirmation__order">Nº {order.order_number}</p>
        <p className="confirmation__status">
          Estado: {ORDER_STATUS_LABELS[order.status] || order.status}
        </p>

        <div className="confirmation__box">
          <h2>Resumen</h2>
          {order.items?.map((item) => (
            <div key={item.id} className="confirmation__row">
              <span>{item.product_name} × {item.quantity}</span>
              <span>{formatPrice(item.subtotal)}</span>
            </div>
          ))}
          <div className="confirmation__row">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="confirmation__row">
            <span>Envío</span>
            <span>{formatPrice(order.shipping_cost)}</span>
          </div>
          <div className="confirmation__row confirmation__row--total">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="confirmation__actions">
          <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-accent">
            Contactar por WhatsApp
          </a>
          <Link to="/productos" className="btn btn-outline">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
