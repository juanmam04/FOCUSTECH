import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { ORDER_STATUS_LABELS, formatPrice } from '../../utils/format';
import './AdminShared.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Dashboard</h1>
      <div className="admin-stats">
        <div className="admin-stat-card">
          <span>Productos</span>
          <strong>{data.total_products}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Categorías</span>
          <strong>{data.total_categories}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Pedidos pendientes</span>
          <strong>{data.pending_orders}</strong>
        </div>
        <div className="admin-stat-card accent">
          <span>Ventas totales</span>
          <strong>{formatPrice(data.total_sales)}</strong>
        </div>
      </div>

      {data.low_stock?.length > 0 && (
        <section className="admin-section">
          <h2>Stock bajo</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td className="text-warning">{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="admin-section">
        <h2>Últimos pedidos</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.recent_orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_number}</td>
                  <td>{o.customer_name}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td><span className="badge">{ORDER_STATUS_LABELS[o.status]}</span></td>
                  <td>
                    <Link to={`/panel/pedidos/${o.id}`} className="admin-link">Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
