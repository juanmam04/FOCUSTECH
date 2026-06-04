import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAlert } from '../../context/AlertContext';
import './AdminShared.css';

export default function AdminCategories() {
  const { toast, confirm } = useAlert();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/categories').then((res) => setCategories(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    const ok = await confirm({
      title: 'Eliminar categoría',
      message: `¿Eliminar "${name}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Categoría eliminada');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <h1 className="admin-page__title" style={{ margin: 0 }}>Categorías</h1>
        <Link to="/panel/categorias/nueva" className="btn btn-primary btn-sm">+ Crear categoría</Link>
      </div>
      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Activa</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.slug}</td>
                  <td>{c.is_active ? 'Sí' : 'No'}</td>
                  <td>
                    <Link to={`/panel/categorias/${c.id}/editar`} className="admin-link">Editar</Link>
                    {' · '}
                    <button type="button" className="admin-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleDelete(c.id, c.name)}>
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
