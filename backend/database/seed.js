import bcrypt from 'bcryptjs';
import '../src/config/loadEnv.js';
import pool from '../src/config/db.js';
import { slugify } from '../src/utils/slugify.js';

const categories = [
  { name: 'Auriculares', description: 'Auriculares inalámbricos y accesorios de audio.' },
  { name: 'Cargadores', description: 'Cargadores rápidos y adaptadores de corriente.' },
  { name: 'Cables', description: 'Cables USB-C, Lightning y multipropósito.' },
  { name: 'Accesorios', description: 'Fundas, fichas, hubs y más accesorios tech.' },
];

const products = [
  { name: 'AirPods Pro 2 USB-C', category: 'Auriculares', price: 8990, compare_at_price: 9990, stock: 12, sku: 'FT-AIRPODS-PRO2', featured: true,
    description: 'Cancelación activa de ruido, audio espacial y estuche MagSafe USB-C.' },
  { name: 'AirPods 3', category: 'Auriculares', price: 5490, stock: 18, sku: 'FT-AIRPODS-3', featured: true,
    description: 'Sonido espacial, resistencia al agua IPX4 y hasta 30h con estuche.' },
  { name: 'Cargador 20W USB-C', category: 'Cargadores', price: 1290, stock: 45, sku: 'FT-CHG-20W', featured: true,
    description: 'Carga rápida compatible con iPhone y accesorios USB-C.' },
  { name: 'Cargador MagSafe 15W', category: 'Cargadores', price: 2890, compare_at_price: 3290, stock: 20, sku: 'FT-MAGSAFE-15', featured: false,
    description: 'Carga inalámbrica magnética para iPhone 12 en adelante.' },
  { name: 'Cable USB-C a Lightning 1m', category: 'Cables', price: 990, stock: 60, sku: 'FT-CBL-CL-1M', featured: true,
    description: 'Cable original compatible para carga y sincronización rápida.' },
  { name: 'Cable USB-C a USB-C 2m', category: 'Cables', price: 1190, stock: 40, sku: 'FT-CBL-CC-2M', featured: false,
    description: 'Cable trenzado reforzado, carga rápida hasta 60W.' },
  { name: 'Adaptador USB-C a USB-A', category: 'Accesorios', price: 690, stock: 35, sku: 'FT-ADP-USBC-A', featured: false,
    description: 'Conectá pendrives y periféricos a tu Mac o iPad USB-C.' },
  { name: 'Ficha USB-C 35W Dual', category: 'Accesorios', price: 2490, stock: 15, sku: 'FT-FICHA-35W', featured: true,
    description: 'Dos puertos USB-C para cargar iPhone y MacBook simultáneamente.' },
  { name: 'Estuche Silicona iPhone 15', category: 'Accesorios', price: 1490, stock: 25, sku: 'FT-CASE-IP15', featured: false,
    description: 'Protección premium con interior suave y agarre antideslizante.' },
];

async function seed() {
  const [existingAdmin] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@focustech.com']);
  if (existingAdmin.length === 0) {
    const hash = await bcrypt.hash('Admin123456', 10);
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Administrador', 'admin@focustech.com', hash, 'admin']
    );
    console.log('Usuario admin creado.');
  }

  const categoryIds = {};
  for (const cat of categories) {
    const slug = slugify(cat.name);
    const [rows] = await pool.query('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (rows.length) {
      categoryIds[cat.name] = rows[0].id;
    } else {
      const [r] = await pool.query(
        'INSERT INTO categories (name, slug, description, is_active) VALUES (?, ?, ?, TRUE)',
        [cat.name, slug, cat.description]
      );
      categoryIds[cat.name] = r.insertId;
    }
  }
  console.log('Categorías listas.');

  for (const p of products) {
    const [exists] = await pool.query('SELECT id FROM products WHERE sku = ?', [p.sku]);
    if (exists.length) continue;

    const slug = slugify(p.name);
    await pool.query(
      `INSERT INTO products (category_id, name, slug, description, price, compare_at_price, stock, sku, is_active, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
      [
        categoryIds[p.category], p.name, slug, p.description,
        p.price, p.compare_at_price || null, p.stock, p.sku, Boolean(p.featured),
      ]
    );
  }
  console.log('Productos de prueba creados.');

  const stockPhotos = {
    'FT-AIRPODS-PRO2': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=800&fit=crop&q=80',
    'FT-AIRPODS-3': 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&h=800&fit=crop&q=80',
    'FT-CHG-20W': 'https://images.unsplash.com/photo-1591290619762-c588fafe69c2?w=800&h=800&fit=crop&q=80',
    'FT-MAGSAFE-15': 'https://images.unsplash.com/photo-1611186874428-7e394e1e1e8c?w=800&h=800&fit=crop&q=80',
    'FT-CBL-CL-1M': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop&q=80',
    'FT-CBL-CC-2M': 'https://images.unsplash.com/photo-1625948515291-69613efd448f?w=800&h=800&fit=crop&q=80',
    'FT-ADP-USBC-A': 'https://images.unsplash.com/photo-1587825141308-601058ac0206?w=800&h=800&fit=crop&q=80',
    'FT-FICHA-35W': 'https://images.unsplash.com/photo-1625948515291-69613efd448f?w=800&h=800&fit=crop&q=80',
    'FT-CASE-IP15': 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=800&fit=crop&q=80',
  };

  for (const [sku, url] of Object.entries(stockPhotos)) {
    const [rows] = await pool.query('SELECT id FROM products WHERE sku = ?', [sku]);
    if (!rows.length) continue;
    const productId = rows[0].id;
    const [imgs] = await pool.query(
      'SELECT id FROM product_images WHERE product_id = ? LIMIT 1',
      [productId]
    );
    if (imgs.length) continue;
    await pool.query(
      'INSERT INTO product_images (product_id, image_url, is_main, position) VALUES (?, ?, TRUE, 0)',
      [productId, url]
    );
  }
  console.log('Imágenes de catálogo asignadas (si faltaban).');

  console.log('Seed completado.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
