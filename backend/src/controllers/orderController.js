import { validationResult } from 'express-validator';
import pool from '../config/db.js';
import { generateOrderNumber } from '../utils/orderNumber.js';

const SHIPPING_COSTS = {
  montevideo: 0,
  interior: 250,
  pickup: 0,
};

function getShippingCost(method) {
  const key = String(method).toLowerCase();
  return SHIPPING_COSTS[key] ?? 250;
}

export async function createOrder(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      customer_name, customer_email, customer_phone,
      department, city, address,
      shipping_method, payment_method, notes,
      items,
    } = req.body;

    if (!items?.length) {
      return res.status(400).json({ success: false, message: 'El pedido debe tener al menos un producto' });
    }

    await connection.beginTransaction();

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const [products] = await connection.query(
        'SELECT id, name, price, stock, is_active FROM products WHERE id = ? FOR UPDATE',
        [item.product_id]
      );

      if (!products.length || !products[0].is_active) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Producto no disponible: ID ${item.product_id}`,
        });
      }

      const product = products[0];
      const qty = Number(item.quantity);

      if (qty < 1 || qty > product.stock) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para "${product.name}" (disponible: ${product.stock})`,
        });
      }

      const lineSubtotal = Number(product.price) * qty;
      subtotal += lineSubtotal;
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        unit_price: product.price,
        quantity: qty,
        subtotal: lineSubtotal,
      });
    }

    const shipping_cost = getShippingCost(shipping_method);
    const total = subtotal + shipping_cost;
    const order_number = generateOrderNumber();

    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        order_number, customer_name, customer_email, customer_phone,
        department, city, address, shipping_method, payment_method,
        status, subtotal, shipping_cost, total, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
      [
        order_number, customer_name, customer_email, customer_phone,
        department, city, address, shipping_method, payment_method,
        subtotal, shipping_cost, total, notes || null,
      ]
    );

    const orderId = orderResult.insertId;

    for (const oi of orderItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, oi.product_id, oi.product_name, oi.unit_price, oi.quantity, oi.subtotal]
      );

      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [oi.quantity, oi.product_id]
      );
    }

    await connection.commit();

    const order = await getOrderById(orderId);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
}

async function getOrderById(id) {
  const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
  if (!orders.length) return null;
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
  return { ...orders[0], items };
}

export async function listOrders(req, res, next) {
  try {
    let sql = 'SELECT * FROM orders';
    const params = [];

    if (req.query.status) {
      sql += ' WHERE status = ?';
      params.push(req.query.status);
    }

    sql += ' ORDER BY created_at DESC';
    const [orders] = await pool.query(sql, params);
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const validStatuses = [
      'pending', 'payment_received', 'preparing', 'shipped', 'delivered', 'cancelled',
    ];
    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Estado inválido' });
    }

    const [existing] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (status === 'cancelled' && existing[0].status !== 'cancelled') {
        const [items] = await connection.query(
          'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
          [req.params.id]
        );
        for (const item of items) {
          await connection.query(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
            [item.quantity, item.product_id]
          );
        }
      }

      await connection.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
      await connection.commit();
    } catch (e) {
      await connection.rollback();
      throw e;
    } finally {
      connection.release();
    }

    const order = await getOrderById(req.params.id);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}
