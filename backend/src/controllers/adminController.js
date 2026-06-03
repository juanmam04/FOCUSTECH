import pool from '../config/db.js';

function n(val) {
  return Number(val) || 0;
}

async function safeQuery(fn, fallback = []) {
  try {
    return await fn();
  } catch (err) {
    if (err.code === '42P01') return fallback;
    throw err;
  }
}

async function trafficMetrics() {
  const [[pvToday]] = await pool.query(
    'SELECT COUNT(*)::int AS c FROM page_views WHERE created_at >= CURRENT_DATE'
  );
  const [[pv7]] = await pool.query(
    "SELECT COUNT(*)::int AS c FROM page_views WHERE created_at >= NOW() - INTERVAL '7 days'"
  );
  const [[pv30]] = await pool.query(
    "SELECT COUNT(*)::int AS c FROM page_views WHERE created_at >= NOW() - INTERVAL '30 days'"
  );
  const [[sessToday]] = await pool.query(
    'SELECT COUNT(DISTINCT session_id)::int AS c FROM page_views WHERE created_at >= CURRENT_DATE'
  );
  const [[sess7]] = await pool.query(
    "SELECT COUNT(DISTINCT session_id)::int AS c FROM page_views WHERE created_at >= NOW() - INTERVAL '7 days'"
  );
  const [[activeNow]] = await pool.query(
    "SELECT COUNT(*)::int AS c FROM analytics_sessions WHERE last_seen >= NOW() - INTERVAL '15 minutes'"
  );
  const [[viewsHour]] = await pool.query(
    "SELECT COUNT(*)::int AS c FROM page_views WHERE created_at >= NOW() - INTERVAL '1 hour'"
  );

  const [viewsByDay] = await pool.query(
    `SELECT DATE(created_at) AS day,
            COUNT(*)::int AS views,
            COUNT(DISTINCT session_id)::int AS sessions
     FROM page_views
     WHERE created_at >= NOW() - INTERVAL '14 days'
     GROUP BY DATE(created_at)
     ORDER BY day ASC`
  );

  const [topPages] = await pool.query(
    `SELECT path, COUNT(*)::int AS views
     FROM page_views
     WHERE created_at >= NOW() - INTERVAL '30 days'
     GROUP BY path
     ORDER BY views DESC
     LIMIT 12`
  );

  const [topReferrers] = await pool.query(
    `SELECT COALESCE(NULLIF(TRIM(referrer), ''), 'Directo / sin referrer') AS referrer,
            COUNT(*)::int AS views
     FROM page_views
     WHERE created_at >= NOW() - INTERVAL '30 days'
     GROUP BY 1
     ORDER BY views DESC
     LIMIT 10`
  );

  return {
    page_views_today: n(pvToday?.c),
    page_views_7d: n(pv7?.c),
    page_views_30d: n(pv30?.c),
    unique_sessions_today: n(sessToday?.c),
    unique_sessions_7d: n(sess7?.c),
    active_sessions_15m: n(activeNow?.c),
    views_last_hour: n(viewsHour?.c),
    views_by_day: viewsByDay.map((r) => ({
      day: r.day,
      views: n(r.views),
      sessions: n(r.sessions),
    })),
    top_pages: topPages,
    top_referrers: topReferrers,
  };
}

async function salesMetrics() {
  const notCancelled = "status NOT IN ('cancelled')";

  const [[revToday]] = await pool.query(
    `SELECT COALESCE(SUM(total), 0) AS t, COUNT(*)::int AS c FROM orders
     WHERE ${notCancelled} AND created_at >= CURRENT_DATE`
  );
  const [[rev7]] = await pool.query(
    `SELECT COALESCE(SUM(total), 0) AS t, COUNT(*)::int AS c FROM orders
     WHERE ${notCancelled} AND created_at >= NOW() - INTERVAL '7 days'`
  );
  const [[rev30]] = await pool.query(
    `SELECT COALESCE(SUM(total), 0) AS t, COUNT(*)::int AS c FROM orders
     WHERE ${notCancelled} AND created_at >= NOW() - INTERVAL '30 days'`
  );
  const [[revAll]] = await pool.query(
    `SELECT COALESCE(SUM(total), 0) AS t, COUNT(*)::int AS c FROM orders WHERE ${notCancelled}`
  );
  const [[pending]] = await pool.query(
    "SELECT COUNT(*)::int AS c FROM orders WHERE status = 'pending'"
  );
  const [[avg]] = await pool.query(
    `SELECT COALESCE(AVG(total), 0) AS a FROM orders WHERE ${notCancelled}`
  );

  const [revenueByDay] = await pool.query(
    `SELECT DATE(created_at) AS day,
            COALESCE(SUM(total), 0) AS revenue,
            COUNT(*)::int AS orders
     FROM orders
     WHERE ${notCancelled} AND created_at >= NOW() - INTERVAL '14 days'
     GROUP BY DATE(created_at)
     ORDER BY day ASC`
  );

  const [ordersByStatus] = await pool.query(
    'SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status ORDER BY count DESC'
  );

  const [byDepartment] = await pool.query(
    `SELECT department, COUNT(*)::int AS orders, COALESCE(SUM(total), 0) AS revenue
     FROM orders WHERE ${notCancelled}
     GROUP BY department ORDER BY orders DESC LIMIT 12`
  );

  const [paymentMethods] = await pool.query(
    `SELECT payment_method, COUNT(*)::int AS count
     FROM orders WHERE ${notCancelled}
     GROUP BY payment_method ORDER BY count DESC`
  );

  return {
    revenue_today: n(revToday?.t),
    orders_today: n(revToday?.c),
    revenue_7d: n(rev7?.t),
    orders_7d: n(rev7?.c),
    revenue_30d: n(rev30?.t),
    orders_30d: n(rev30?.c),
    revenue_total: n(revAll?.t),
    orders_total: n(revAll?.c),
    pending_orders: n(pending?.c),
    avg_order_value: n(avg?.a),
    revenue_by_day: revenueByDay.map((r) => ({
      day: r.day,
      revenue: n(r.revenue),
      orders: n(r.orders),
    })),
    orders_by_status: ordersByStatus,
    by_department: byDepartment.map((r) => ({
      department: r.department,
      orders: n(r.orders),
      revenue: n(r.revenue),
    })),
    payment_methods: paymentMethods,
  };
}

async function catalogMetrics() {
  const [[products]] = await pool.query('SELECT COUNT(*)::int AS c FROM products');
  const [[active]] = await pool.query('SELECT COUNT(*)::int AS c FROM products WHERE is_active = TRUE');
  const [[featured]] = await pool.query('SELECT COUNT(*)::int AS c FROM products WHERE is_featured = TRUE');
  const [[outStock]] = await pool.query('SELECT COUNT(*)::int AS c FROM products WHERE stock < 1');
  const [[lowStock]] = await pool.query('SELECT COUNT(*)::int AS c FROM products WHERE stock > 0 AND stock <= 5');
  const [[categories]] = await pool.query('SELECT COUNT(*)::int AS c FROM categories');
  const [[catActive]] = await pool.query('SELECT COUNT(*)::int AS c FROM categories WHERE is_active = TRUE');

  const [lowStockList] = await pool.query(
    'SELECT id, name, stock, sku FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 10'
  );

  const [topProducts] = await pool.query(
    `SELECT oi.product_id, oi.product_name,
            SUM(oi.quantity)::int AS units_sold,
            SUM(oi.subtotal) AS revenue
     FROM order_items oi
     INNER JOIN orders o ON o.id = oi.order_id
     WHERE o.status NOT IN ('cancelled')
     GROUP BY oi.product_id, oi.product_name
     ORDER BY units_sold DESC
     LIMIT 10`
  );

  const [byCategory] = await pool.query(
    `SELECT c.name AS category, COUNT(p.id)::int AS products,
            COALESCE(SUM(CASE WHEN p.is_active THEN 1 ELSE 0 END), 0)::int AS active_products
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id, c.name
     ORDER BY products DESC`
  );

  return {
    total_products: n(products?.c),
    active_products: n(active?.c),
    inactive_products: n(products?.c) - n(active?.c),
    featured_products: n(featured?.c),
    out_of_stock: n(outStock?.c),
    low_stock_count: n(lowStock?.c),
    total_categories: n(categories?.c),
    active_categories: n(catActive?.c),
    low_stock: lowStockList,
    top_products: topProducts.map((r) => ({
      product_id: r.product_id,
      product_name: r.product_name,
      units_sold: n(r.units_sold),
      revenue: n(r.revenue),
    })),
    by_category: byCategory,
  };
}

async function funnelMetrics() {
  const [[views7]] = await pool.query(
    "SELECT COUNT(*)::int AS c FROM page_views WHERE created_at >= NOW() - INTERVAL '7 days'"
  );
  const [[orders7]] = await pool.query(
    "SELECT COUNT(*)::int AS c FROM orders WHERE created_at >= NOW() - INTERVAL '7 days' AND status NOT IN ('cancelled')"
  );

  const [events] = await pool.query(
    `SELECT event_type, COUNT(*)::int AS count
     FROM analytics_events
     WHERE created_at >= NOW() - INTERVAL '7 days'
     GROUP BY event_type`
  );

  const eventMap = Object.fromEntries(events.map((e) => [e.event_type, n(e.count)]));
  const views = n(views7?.c);
  const orders = n(orders7?.c);

  return {
    page_views_7d: views,
    add_to_cart_7d: eventMap.add_to_cart || 0,
    begin_checkout_7d: eventMap.begin_checkout || 0,
    purchase_7d: eventMap.purchase || eventMap.order_complete || orders,
    orders_7d: orders,
    conversion_rate: views > 0 ? Math.round((orders / views) * 10000) / 100 : 0,
    events_7d: events,
  };
}

export async function getDashboard(req, res, next) {
  try {
    const [recentOrders] = await pool.query(
      'SELECT id, order_number, customer_name, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 8'
    );

    const sales = await salesMetrics();
    const catalog = await catalogMetrics();
    let traffic = null;
    traffic = await safeQuery(() => trafficMetrics(), {
      page_views_today: 0,
      page_views_7d: 0,
      unique_sessions_today: 0,
      active_sessions_15m: 0,
      views_by_day: [],
      top_pages: [],
    });

    const funnel = await safeQuery(() => funnelMetrics(), {
      page_views_7d: 0,
      add_to_cart_7d: 0,
      begin_checkout_7d: 0,
      orders_7d: 0,
      conversion_rate: 0,
      events_7d: [],
    });

    res.json({
      success: true,
      data: {
        total_products: catalog.total_products,
        total_categories: catalog.total_categories,
        pending_orders: sales.pending_orders,
        total_sales: sales.revenue_total,
        orders_today: sales.orders_today,
        revenue_today: sales.revenue_today,
        page_views_today: traffic.page_views_today,
        unique_sessions_today: traffic.unique_sessions_today,
        active_sessions_15m: traffic.active_sessions_15m,
        conversion_rate_7d: funnel.conversion_rate,
        low_stock: catalog.low_stock,
        recent_orders: recentOrders,
        traffic_chart: traffic.views_by_day,
        revenue_chart: sales.revenue_by_day,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAnalytics(req, res, next) {
  try {
    const traffic = await safeQuery(() => trafficMetrics(), {});
    const sales = await salesMetrics();
    const catalog = await catalogMetrics();
    const funnel = await safeQuery(() => funnelMetrics(), {});

    const [recentOrders] = await pool.query(
      'SELECT id, order_number, customer_name, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 15'
    );

    const [hourlyToday] = await safeQuery(
      () =>
        pool.query(
          `SELECT EXTRACT(HOUR FROM created_at)::int AS hour, COUNT(*)::int AS views
           FROM page_views
           WHERE created_at >= CURRENT_DATE
           GROUP BY 1 ORDER BY 1`
        ).then(([rows]) => rows),
      []
    );

    res.json({
      success: true,
      data: {
        generated_at: new Date().toISOString(),
        traffic,
        sales,
        catalog,
        funnel,
        hourly_views_today: hourlyToday,
        recent_orders: recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
}
