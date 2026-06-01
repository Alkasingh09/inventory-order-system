import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/api';

const emptyForm = { name: '', email: '', phone: '' };

function Customers() {
  const [customers, setCustomers] = useState([]);
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
    getCustomers().then((r) => setCustomers(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setShow(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, email: c.email, phone: c.phone || '' }); setErrors({}); setShow(true); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const d = { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || undefined };
      if (editing) { await updateCustomer(editing.id, d); toast.success('Customer updated'); }
      else { await createCustomer(d); toast.success('Customer created'); }
      setShow(false); load();
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'object' ? detail.message : detail || 'Error');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try { await deleteCustomer(deleting.id); toast.success('Customer deleted'); setDeleting(null); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage your customer directory</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>New Customer</button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-wrap">
            <input className="search-input" type="text" placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span className="result-count">{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4"><div className="spinner"><div className="spinner-ring"></div></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="4"><div className="empty-state"><p>{search ? 'No matches found' : 'No customers yet'}</p></div></td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td data-label="Name" style={{ fontWeight: 600 }}>{c.name}</td>
                    <td data-label="Email">{c.email}</td>
                    <td data-label="Phone">{c.phone || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td data-label="">
                      <div className="row-actions">
                        <button className="action-btn edit" onClick={() => openEdit(c)} title="Edit">&#9998;</button>
                        <button className="action-btn delete" onClick={() => setDeleting(c)} title="Delete">&#10005;</button>
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
              <h2>{editing ? 'Edit Customer' : 'New Customer'}</h2>
              <button className="modal-close" onClick={() => setShow(false)}>&#10005;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input className={errors.name ? 'error' : ''} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className={errors.email ? 'error' : ''} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
                  {errors.email && <div className="form-error">{errors.email}</div>}
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShow(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update Customer' : 'Create Customer'}</button>
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
              <h2>Delete Customer</h2>
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

export default Customers;
