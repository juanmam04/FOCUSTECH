import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import BarChart from '../../components/admin/BarChart';
import { ORDER_STATUS_LABELS, formatPrice } from '../../utils/format';
import './AdminShared.css';
import './AdminMetrics.css';

const EVENT_LABELS = {
  add_to_cart: 'Agregar al carrito',
  begin_checkout: 'Iniciar checkout',
  purchase: 'Compra',
  order_complete: 'Pedido',
};

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/analytics')
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

  const { traffic, sales, catalog, funnel } = data;

  return (
    <div className="admin-page metrics-page">
      <div className="metrics-page__head">
        <div>
          <h1>Analíticas</h1>
          <p>
            Tráfico, ventas, catálogo y embudo.
            {data.generated_at && (
              <> Actualizado {new Date(data.generated_at).toLocaleString('es-UY')}.</>
            )}
          </p>
        </div>
        <span className="metrics-live">
          {traffic.active_sessions_15m} activos · {traffic.views_last_hour} vistas/h
        </span>
      </div>

      <nav className="metrics-tabs">
        <a href="#trafico">Tráfico</a>
        <a href="#ventas">Ventas</a>
        <a href="#catalogo">Catálogo</a>
        <a href="#embudo">Embudo</a>
      </nav>

      <section id="trafico" className="metrics-section">
        <h2>Tráfico y audiencia</h2>
        <div className="metrics-kpi">
          <div className="metrics-kpi__card">
            <span>Vistas hoy</span>
            <strong>{traffic.page_views_today}</strong>
          </div>
          <div className="metrics-kpi__card">
            <span>Vistas 7 días</span>
            <strong>{traffic.page_views_7d}</strong>
          </div>
          <div className="metrics-kpi__card">
            <span>Vistas 30 días</span>
            <strong>{traffic.page_views_30d}</strong>
          </div>
          <div className="metrics-kpi__card">
            <span>Sesiones únicas hoy</span>
            <strong>{traffic.unique_sessions_today}</strong>
          </div>
          <div className="metrics-kpi__card">
            <span>Sesiones 7 días</span>
            <strong>{traffic.unique_sessions_7d}</strong>
          </div>
          <div className="metrics-kpi__card metrics-kpi__card--ok">
            <span>Sesiones activas</span>
            <strong>{traffic.active_sessions_15m}</strong>
            <small>últimos 15 min</small>
          </div>
        </div>

        <div className="metrics-grid metrics-grid--2">
          <div className="metrics-card">
            <h2>Vistas por día (14 días)</h2>
            <BarChart
              data={traffic.views_by_day.map((r) => ({ label: r.day, value: r.views }))}
            />
          </div>
          <div className="metrics-card">
            <h2>Sesiones por día</h2>
            <BarChart
              data={traffic.views_by_day.map((r) => ({ label: r.day, value: r.sessions }))}
            />
          </div>
        </div>

        <div className="metrics-grid metrics-grid--2">
          <div className="metrics-card">
            <h2>Páginas más visitadas (30 días)</h2>
            <BarChart
              data={traffic.top_pages.map((r) => ({ label: r.path, value: r.views }))}
            />
          </div>
          <div className="metrics-card">
            <h2>Origen del tráfico</h2>
            <BarChart
              data={traffic.top_referrers.map((r) => ({
                label: r.referrer,
                value: r.views,
              }))}
            />
          </div>
        </div>

        {data.hourly_views_today?.length > 0 && (
          <div className="metrics-card">
            <h2>Vistas por hora (hoy)</h2>
            <BarChart
              data={data.hourly_views_today.map((r) => ({
                label: `${r.hour}:00`,
                value: r.views,
              }))}
            />
          </div>
        )}
      </section>

      <section id="ventas" className="metrics-section">
        <h2>Ventas e ingresos</h2>
        <div className="metrics-kpi">
          <div className="metrics-kpi__card metrics-kpi__card--accent">
            <span>Ingresos totales</span>
            <strong>{formatPrice(sales.revenue_total)}</strong>
            <small>{sales.orders_total} pedidos</small>
          </div>
          <div className="metrics-kpi__card">
            <span>Hoy</span>
            <strong>{formatPrice(sales.revenue_today)}</strong>
            <small>{sales.orders_today} pedidos</small>
          </div>
          <div className="metrics-kpi__card">
            <span>7 días</span>
            <strong>{formatPrice(sales.revenue_7d)}</strong>
            <small>{sales.orders_7d} pedidos</small>
          </div>
          <div className="metrics-kpi__card">
            <span>30 días</span>
            <strong>{formatPrice(sales.revenue_30d)}</strong>
            <small>{sales.orders_30d} pedidos</small>
          </div>
          <div className="metrics-kpi__card">
            <span>Ticket promedio</span>
            <strong>{formatPrice(sales.avg_order_value)}</strong>
          </div>
          <div className="metrics-kpi__card">
            <span>Pendientes</span>
            <strong>{sales.pending_orders}</strong>
          </div>
        </div>

        <div className="metrics-card">
          <h2>Ingresos por día</h2>
          <BarChart
            data={sales.revenue_by_day.map((r) => ({ label: r.day, value: r.revenue }))}
            formatValue={(v) => formatPrice(v)}
          />
        </div>

        <div className="metrics-grid metrics-grid--2">
          <div className="metrics-card">
            <h2>Pedidos por estado</h2>
            <div className="metrics-pill-row">
              {sales.orders_by_status.map((r) => (
                <span key={r.status} className="metrics-pill">
                  {ORDER_STATUS_LABELS[r.status] || r.status}
                  <em>{r.count}</em>
                </span>
              ))}
            </div>
            <h3>Métodos de pago</h3>
            <div className="metrics-pill-row">
              {sales.payment_methods.map((r) => (
                <span key={r.payment_method} className="metrics-pill">
                  {r.payment_method}
                  <em>{r.count}</em>
                </span>
              ))}
            </div>
          </div>
          <div className="metrics-card">
            <h2>Pedidos por departamento</h2>
            <BarChart
              data={sales.by_department.map((r) => ({
                label: r.department,
                value: r.orders,
              }))}
            />
          </div>
        </div>
      </section>

      <section id="catalogo" className="metrics-section">
        <h2>Catálogo e inventario</h2>
        <div className="metrics-kpi">
          <div className="metrics-kpi__card">
            <span>Productos activos</span>
            <strong>{catalog.active_products}</strong>
            <small>de {catalog.total_products}</small>
          </div>
          <div className="metrics-kpi__card">
            <span>Destacados</span>
            <strong>{catalog.featured_products}</strong>
          </div>
          <div className="metrics-kpi__card">
            <span>Sin stock</span>
            <strong>{catalog.out_of_stock}</strong>
          </div>
          <div className="metrics-kpi__card">
            <span>Stock bajo</span>
            <strong>{catalog.low_stock_count}</strong>
          </div>
          <div className="metrics-kpi__card">
            <span>Categorías</span>
            <strong>{catalog.active_categories}</strong>
            <small>de {catalog.total_categories}</small>
          </div>
        </div>

        <div className="metrics-grid metrics-grid--2">
          <div className="metrics-card">
            <h2>Productos más vendidos</h2>
            {catalog.top_products.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Unidades</th>
                      <th>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalog.top_products.map((p) => (
                      <tr key={p.product_id}>
                        <td>{p.product_name}</td>
                        <td>{p.units_sold}</td>
                        <td>{formatPrice(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="metrics-empty">Aún no hay ventas registradas.</p>
            )}
          </div>
          <div className="metrics-card">
            <h2>Productos por categoría</h2>
            <BarChart
              data={catalog.by_category.map((r) => ({
                label: r.category,
                value: r.products,
              }))}
            />
          </div>
        </div>
      </section>

      <section id="embudo" className="metrics-section">
        <h2>Embudo de conversión (7 días)</h2>
        <div className="metrics-funnel">
          <div className="metrics-funnel__step">
            <strong>{funnel.page_views_7d}</strong>
            <span>Vistas</span>
          </div>
          <div className="metrics-funnel__step">
            <strong>{funnel.add_to_cart_7d}</strong>
            <span>Al carrito</span>
          </div>
          <div className="metrics-funnel__step">
            <strong>{funnel.begin_checkout_7d}</strong>
            <span>Checkout</span>
          </div>
          <div className="metrics-funnel__step">
            <strong>{funnel.orders_7d}</strong>
            <span>Pedidos</span>
          </div>
          <div className="metrics-funnel__step">
            <strong>{funnel.conversion_rate}%</strong>
            <span>Conversión vista→pedido</span>
          </div>
        </div>

        {funnel.events_7d?.length > 0 && (
          <div className="metrics-card" style={{ marginTop: '1.25rem' }}>
            <h2>Eventos registrados</h2>
            <div className="metrics-pill-row">
              {funnel.events_7d.map((e) => (
                <span key={e.event_type} className="metrics-pill">
                  {EVENT_LABELS[e.event_type] || e.event_type}
                  <em>{e.count}</em>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

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
              {data.recent_orders.map((o) => (
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
