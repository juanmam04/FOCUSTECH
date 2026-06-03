import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { slugify } from '../../utils/slug';
import { imageUrl } from '../../utils/images';
import './AdminShared.css';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  compare_at_price: '',
  stock: 0,
  sku: '',
  category_id: '',
  is_active: true,
  is_featured: false,
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [slugManual, setSlugManual] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get('/products')
      .then((res) => {
        const product = res.data.data.find((p) => String(p.id) === String(id));
        if (!product) throw new Error('not found');
        setForm({
          name: product.name,
          slug: product.slug,
          description: product.description || '',
          price: product.price,
          compare_at_price: product.compare_at_price || '',
          stock: product.stock,
          sku: product.sku,
          category_id: product.category_id,
          is_active: Boolean(product.is_active),
          is_featured: Boolean(product.is_featured),
        });
        setSlugManual(true);
        return api.get(`/products/${product.slug}`);
      })
      .then((res) => setImages(res.data.data.images || []))
      .catch(() => setError('Producto no encontrado'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => {
      const next = {
        ...f,
        [name]: type === 'checkbox' ? checked : value,
      };
      if (name === 'name' && !slugManual) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      stock: Number(form.stock),
      category_id: Number(form.category_id),
    };
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        setSuccess('Producto actualizado');
      } else {
        const res = await api.post('/products', payload);
        navigate(`/panel/productos/${res.data.data.id}/editar`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleImages = async (e) => {
    const files = e.target.files;
    if (!files?.length || !id) return;
    const fd = new FormData();
    for (const file of files) fd.append('images', file);
    fd.append('is_main', 'true');
    try {
      const res = await api.post(`/products/${id}/images`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages(res.data.data);
      setSuccess('Imágenes subidas');
    } catch {
      setError('Error al subir imágenes');
    }
  };

  const setMain = async (imageId) => {
    await api.patch(`/products/images/${imageId}/main`);
    const res = await api.get('/products', { params: {} });
    const product = res.data.data.find((p) => String(p.id) === String(id));
    if (product) {
      const detail = await api.get(`/products/${product.slug}`);
      setImages(detail.data.data.images);
    }
  };

  const removeImage = async (imageId) => {
    if (!window.confirm('¿Eliminar imagen?')) return;
    await api.delete(`/products/images/${imageId}`);
    setImages((imgs) => imgs.filter((i) => i.id !== imageId));
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">{isEdit ? 'Editar producto' : 'Crear producto'}</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Nombre</label>
          <input className="input" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="label">Slug</label>
          <input
            className="input"
            name="slug"
            value={form.slug}
            onChange={(e) => { setSlugManual(true); handleChange(e); }}
            required
          />
        </div>
        <div className="form-group">
          <label className="label">Descripción</label>
          <textarea className="textarea" name="description" rows={4} value={form.description} onChange={handleChange} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="label">Precio</label>
            <input className="input" type="number" name="price" min="0" step="1" value={form.price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="label">Precio anterior (opcional)</label>
            <input className="input" type="number" name="compare_at_price" min="0" step="1" value={form.compare_at_price} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="label">Stock</label>
            <input className="input" type="number" name="stock" min="0" value={form.stock} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="label">SKU</label>
            <input className="input" name="sku" value={form.sku} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-group">
          <label className="label">Categoría</label>
          <select className="select" name="category_id" value={form.category_id} onChange={handleChange} required>
            <option value="">Seleccionar...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="checkbox-row">
          <label>
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
            Activo
          </label>
          <label>
            <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
            Destacado
          </label>
        </div>

        {isEdit && (
          <div className="form-group" style={{ marginTop: '2rem' }}>
            <label className="label">Imágenes</label>
            <input type="file" accept="image/*" multiple onChange={handleImages} />
            <div className="admin-images">
              {images.map((img) => (
                <div key={img.id} className={`admin-image-thumb ${img.is_main ? 'main' : ''}`}>
                  <img src={imageUrl(img.image_url)} alt="" />
                  <div className="admin-image-actions">
                    {!img.is_main && (
                      <button type="button" onClick={() => setMain(img.id)}>Principal</button>
                    )}
                    <button type="button" onClick={() => removeImage(img.id)}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <Link to="/panel/productos" className="btn btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
