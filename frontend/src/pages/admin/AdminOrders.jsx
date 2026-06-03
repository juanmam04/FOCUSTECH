import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { ORDER_STATUS_LABELS, formatPrice } from '../../utils/format';
import './AdminShared.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/orders', { params: status ? { status } : {} })
      .then((res) => setOrders(res.data.data))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Pedidos</h1>
      <div className="admin-toolbar">
        <select className="select" style={{ maxWidth: 220 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nº pedido</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_number}</td>
                  <td>{o.customer_name}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td><span className="badge">{ORDER_STATUS_LABELS[o.status]}</span></td>
                  <td>{new Date(o.created_at).toLocaleDateString('es-UY')}</td>
                  <td><Link to={`/panel/pedidos/${o.id}`} className="admin-link">Ver detalle</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
