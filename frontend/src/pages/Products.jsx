import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';

const emptyForm = { name: '', sku: '', price: '', stock_quantity: '' };

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    getProducts().then((r) => setProducts(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setShow(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, sku: p.sku, price: p.price, stock_quantity: p.stock_quantity }); setErrors({}); setShow(true); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.sku.trim()) e.sku = 'Required';
    if (!form.price || parseFloat(form.price) < 0) e.price = 'Invalid';
    if (form.stock_quantity === '' || parseInt(form.stock_quantity) < 0) e.stock_quantity = 'Invalid';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const d = { name: form.name.trim(), sku: form.sku.trim(), price: parseFloat(form.price), stock_quantity: parseInt(form.stock_quantity) };
      if (editing) { await updateProduct(editing.id, d); toast.success('Product updated'); }
      else { await createProduct(d); toast.success('Product created'); }
      setShow(false); load();
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'object' ? detail.message : detail || 'Error');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try { await deleteProduct(deleting.id); toast.success('Product deleted'); setDeleting(null); load(); }
    catch { toast.error('Delete failed'); }
  };

  const stockBadge = (qty) => {
    if (qty > 10) return 'badge-emerald';
    if (qty > 0) return 'badge-amber';
    return 'badge-red';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your product inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>New Product</button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-wrap">
            <input className="search-input" type="text" placeholder="Search name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span className="result-count">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5"><div className="spinner"><div className="spinner-ring"></div></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5"><div className="empty-state"><p>{search ? 'No matches found' : 'No products yet'}</p></div></td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td data-label="Name" style={{ fontWeight: 600 }}>{p.name}</td>
                    <td data-label="SKU"><span className="badge badge-indigo">{p.sku}</span></td>
                    <td data-label="Price">${p.price.toFixed(2)}</td>
                    <td data-label="Stock"><span className={`badge ${stockBadge(p.stock_quantity)}`}>{p.stock_quantity}</span></td>
                    <td data-label="">
                      <div className="row-actions">
                        <button className="action-btn edit" onClick={() => openEdit(p)} title="Edit">&#9998;</button>
                        <button className="action-btn delete" onClick={() => setDeleting(p)} title="Delete">&#10005;</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {show && (
        <div className="modal-overlay" onClick={() => !submitting && setShow(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Product' : 'New Product'}</h2>
              <button className="modal-close" onClick={() => setShow(false)}>&#10005;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Product Name</label>
                  <input className={errors.name ? 'error' : ''} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wireless Keyboard" />
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input className={errors.sku ? 'error' : ''} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. KB-001" />
                  {errors.sku && <div className="form-error">{errors.sku}</div>}
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input type="number" step="0.01" min="0" className={errors.price ? 'error' : ''} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                  {errors.price && <div className="form-error">{errors.price}</div>}
                </div>
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input type="number" min="0" className={errors.stock_quantity ? 'error' : ''} value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} placeholder="0" />
                  {errors.stock_quantity && <div className="form-error">{errors.stock_quantity}</div>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShow(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleting && (
        <div className="modal-overlay" onClick={() => setDeleting(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className="confirm-dialog">
              <div className="confirm-icon">!</div>
              <h2>Delete Product</h2>
              <p>Are you sure you want to delete <strong>{deleting.name}</strong>? This action cannot be undone.</p>
              <div className="modal-footer" style={{ justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleting(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
