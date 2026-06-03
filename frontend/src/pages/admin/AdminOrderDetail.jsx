import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/client';
import { ORDER_STATUS_LABELS, formatPrice } from '../../utils/format';
import './AdminShared.css';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = () => {
    api.get(`/orders/${id}`).then((res) => {
      setOrder(res.data.data);
      setStatus(res.data.data.status);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async () => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      setMessage('Estado actualizado');
      load();
    } catch {
      setMessage('Error al actualizar estado');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!order) return <div className="alert alert-error">Pedido no encontrado</div>;

  return (
    <div className="admin-page">
      <Link to="/panel/pedidos" className="admin-link">← Volver a pedidos</Link>
      <h1 className="admin-page__title">Pedido {order.order_number}</h1>
      {message && <div className="alert alert-success">{message}</div>}

      <div className="admin-stats" style={{ marginBottom: '2rem' }}>
        <div className="admin-stat-card">
          <span>Estado</span>
          <strong>{ORDER_STATUS_LABELS[order.status]}</strong>
        </div>
        <div className="admin-stat-card accent">
          <span>Total</span>
          <strong>{formatPrice(order.total)}</strong>
        </div>
      </div>

      <section className="admin-section">
        <h2>Cliente</h2>
        <p><strong>{order.customer_name}</strong></p>
        <p>{order.customer_email} · {order.customer_phone}</p>
        <p>{order.address}, {order.city}, {order.department}</p>
        <p>Envío: {order.shipping_method} · Pago: {order.payment_method}</p>
        {order.notes && <p>Notas: {order.notes}</p>}
      </section>

      <section className="admin-section">
        <h2>Productos</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio unit.</th>
                <th>Cant.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td>{formatPrice(item.unit_price)}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: '1rem' }}>
          Subtotal: {formatPrice(order.subtotal)} · Envío: {formatPrice(order.shipping_cost)}
        </p>
      </section>

      <section className="admin-section">
        <h2>Cambiar estado</h2>
        <div className="admin-toolbar">
          <select className="select" style={{ maxWidth: 280 }} value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button type="button" className="btn btn-primary btn-sm" onClick={updateStatus}>
            Actualizar estado
          </button>
        </div>
      </section>
    </div>
  );
}
