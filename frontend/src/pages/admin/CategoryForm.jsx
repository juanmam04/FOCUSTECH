import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { slugify } from '../../utils/slug';
import './AdminShared.css';

export default function CategoryForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', slug: '', description: '', is_active: true });
  const [slugManual, setSlugManual] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api
      .get('/categories')
      .then((res) => {
        const cat = res.data.data.find((c) => String(c.id) === String(id));
        if (cat) {
          setForm({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            is_active: Boolean(cat.is_active),
          });
          setSlugManual(true);
        }
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => {
      const next = { ...f, [name]: type === 'checkbox' ? checked : value };
      if (name === 'name' && !slugManual) next.slug = slugify(value);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) {
        await api.put(`/categories/${id}`, form);
      } else {
        await api.post('/categories', form);
      }
      navigate('/panel/categorias');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">{isEdit ? 'Editar categoría' : 'Crear categoría'}</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Nombre</label>
          <input className="input" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="label">Slug</label>
          <input className="input" name="slug" value={form.slug} onChange={(e) => { setSlugManual(true); handleChange(e); }} required />
        </div>
        <div className="form-group">
          <label className="label">Descripción</label>
          <textarea className="textarea" name="description" rows={3} value={form.description} onChange={handleChange} />
        </div>
        <label className="checkbox-row">
          <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
          Activa
        </label>
        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary">Guardar</button>
          <Link to="/panel/categorias" className="btn btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
