import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import BarChart from '../../components/admin/BarChart';
import { ORDER_STATUS_LABELS, formatPrice } from '../../utils/format';
import './AdminShared.css';
import './AdminMetrics.css';

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
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  const trafficChart = (data.traffic_chart || []).map((r) => ({
    label: r.day,
    value: r.views,
  }));
  const revenueChart = (data.revenue_chart || []).map((r) => ({
    label: r.day,
    value: r.revenue,
  }));

  return (
    <div className="admin-page metrics-page">
      <div className="metrics-page__head">
        <div>
          <h1>Resumen</h1>
          <p>Vista general de la tienda, ventas y tráfico.</p>
        </div>
        <Link to="/panel/analiticas" className="btn btn-primary btn-sm">
          Ver analíticas completas →
        </Link>
      </div>

      <div className="metrics-kpi">
        <div className="metrics-kpi__card metrics-kpi__card--accent">
          <span>Ventas totales</span>
          <strong>{formatPrice(data.total_sales)}</strong>
        </div>
        <div className="metrics-kpi__card">
          <span>Ingresos hoy</span>
          <strong>{formatPrice(data.revenue_today)}</strong>
          <small>{data.orders_today} pedidos</small>
        </div>
        <div className="metrics-kpi__card">
          <span>Pedidos pendientes</span>
          <strong>{data.pending_orders}</strong>
        </div>
        <div className="metrics-kpi__card metrics-kpi__card--ok">
          <span>Visitas hoy</span>
          <strong>{data.page_views_today ?? 0}</strong>
          <small>{data.unique_sessions_today ?? 0} sesiones</small>
        </div>
        <div className="metrics-kpi__card">
          <span>En línea (15 min)</span>
          <strong>{data.active_sessions_15m ?? 0}</strong>
        </div>
        <div className="metrics-kpi__card">
          <span>Conversión 7 días</span>
          <strong>{data.conversion_rate_7d ?? 0}%</strong>
        </div>
        <div className="metrics-kpi__card">
          <span>Productos</span>
          <strong>{data.total_products}</strong>
          <small>{data.total_categories} categorías</small>
        </div>
      </div>

      <div className="metrics-grid metrics-grid--2">
        <div className="metrics-card">
          <h2>Tráfico — últimos 14 días</h2>
          <BarChart data={trafficChart} valueKey="value" labelKey="label" />
        </div>
        <div className="metrics-card">
          <h2>Ingresos — últimos 14 días</h2>
          <BarChart
            data={revenueChart}
            valueKey="value"
            labelKey="label"
            formatValue={(v) => formatPrice(v)}
          />
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
                <th />
              </tr>
            </thead>
            <tbody>
              {data.recent_orders?.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_number}</td>
                  <td>{o.customer_name}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td>
                    <span className="badge">{ORDER_STATUS_LABELS[o.status]}</span>
                  </td>
                  <td>
                    <Link to={`/panel/pedidos/${o.id}`} className="admin-link">
                      Ver
                    </Link>
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
