import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { formatPrice } from '../../utils/format';
import './AdminShared.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/products')
      .then((res) => setProducts(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      setMessage('Producto eliminado');
      load();
    } catch {
      setMessage('Error al eliminar');
    }
  };

  const toggleField = async (product, field) => {
    try {
      const payload = {
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: Number(product.price),
        compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : null,
        stock: Number(product.stock),
        sku: product.sku,
        category_id: Number(product.category_id),
        is_active: field === 'is_active' ? !product.is_active : Boolean(product.is_active),
        is_featured: field === 'is_featured' ? !product.is_featured : Boolean(product.is_featured),
      };
      await api.put(`/products/${product.id}`, payload);
      load();
    } catch {
      setMessage('Error al actualizar');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <h1 className="admin-page__title" style={{ margin: 0 }}>Productos</h1>
        <Link to="/panel/productos/nuevo" className="btn btn-primary btn-sm">+ Crear producto</Link>
      </div>
      {message && <div className="alert alert-success">{message}</div>}
      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>SKU</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Activo</th>
                <th>Destacado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleField(p, 'is_active')}>
                      {p.is_active ? 'Sí' : 'No'}
                    </button>
                  </td>
                  <td>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleField(p, 'is_featured')}>
                      {p.is_featured ? 'Sí' : 'No'}
                    </button>
                  </td>
                  <td>
                    <Link to={`/panel/productos/${p.id}/editar`} className="admin-link">Editar</Link>
                    {' · '}
                    <button type="button" className="admin-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleDelete(p.id, p.name)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
