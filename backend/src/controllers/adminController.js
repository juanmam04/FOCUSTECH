import pool from '../config/db.js';

export async function getDashboard(req, res, next) {
  try {
    const [[products]] = await pool.query('SELECT COUNT(*) AS total FROM products');
    const [[categories]] = await pool.query('SELECT COUNT(*) AS total FROM categories');
    const [[pendingOrders]] = await pool.query(
      "SELECT COUNT(*) AS total FROM orders WHERE status = 'pending'"
    );
    const [[sales]] = await pool.query(
      "SELECT COALESCE(SUM(total), 0) AS total FROM orders WHERE status NOT IN ('cancelled')"
    );
    const [lowStock] = await pool.query(
      'SELECT id, name, stock, sku FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 10'
    );
    const [recentOrders] = await pool.query(
      'SELECT id, order_number, customer_name, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 8'
    );

    res.json({
      success: true,
      data: {
        total_products: products.total,
        total_categories: categories.total,
        pending_orders: pendingOrders.total,
        total_sales: Number(sales.total),
        low_stock: lowStock,
        recent_orders: recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
}
