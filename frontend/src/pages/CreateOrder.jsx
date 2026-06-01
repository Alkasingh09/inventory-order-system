import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCustomers, getProducts, createOrder } from '../services/api';

function CreateOrder() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getCustomers(), getProducts()])
      .then(([cR, pR]) => { setCustomers(cR.data); setProducts(pR.data); })
      .catch(() => toast.error('Failed to load data'));
  }, []);

  const addItem = () => {
    if (!selectedProductId) { toast.error('Select a product'); return; }
    const product = products.find((p) => p.id === parseInt(selectedProductId));
    if (!product) return;
    if (selectedQty < 1) { toast.error('Invalid quantity'); return; }
    if (selectedQty > product.stock_quantity) { toast.error(`Only ${product.stock_quantity} available`); return; }
    const existing = items.find((i) => i.product_id === product.id);
    if (existing) {
      const total = existing.quantity + selectedQty;
      if (total > product.stock_quantity) { toast.error(`Only ${product.stock_quantity} available`); return; }
      setItems(items.map((i) => i.product_id === product.id ? { ...i, quantity: total, subtotal: total * product.price } : i));
      toast.success(`Updated ${product.name} qty to ${total}`);
    } else {
      setItems([...items, { product_id: product.id, product_name: product.name, quantity: selectedQty, unit_price: product.price, subtotal: selectedQty * product.price }]);
      toast.success(`Added ${product.name}`);
    }
    setSelectedProductId('');
    setSelectedQty(1);
  };

  const removeItem = (idx) => {
    const removed = items[idx];
    setItems(items.filter((_, i) => i !== idx));
    toast(`Removed ${removed.product_name}`);
  };

  const total = items.reduce((s, i) => s + i.subtotal, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) { toast.error('Select a customer'); return; }
    if (!items.length) { toast.error('Add at least one item'); return; }
    setSubmitting(true);
    try {
      await createOrder({ customer_id: parseInt(customerId), items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })) });
      toast.success('Order created successfully!');
      setTimeout(() => navigate('/orders'), 1000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'object' ? detail.message : detail || 'Error');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="page-header">
        <div>
          <h1>New Order</h1>
          <p>Create a new order for a customer</p>
        </div>
      </div>

      <div className="table-card">
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px 24px 0' }}>
            <div className="form-group">
              <label>Customer</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                <option value="">Select a customer...</option>
                {customers.map((c) => (<option key={c.id} value={c.id}>{c.name} — {c.email}</option>))}
              </select>
            </div>
          </div>

          <div style={{ padding: '0 24px', marginTop: 20, marginBottom: 4 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>Order Items</div>
            <div className="add-item-section">
              <div className="add-item-row">
                <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
                  <option value="">Select a product...</option>
                  {products.map((p) => (<option key={p.id} value={p.id}>{p.name} — ${p.price.toFixed(2)} ({p.stock_quantity} in stock)</option>))}
                </select>
                <input type="number" min="1" value={selectedQty} onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))} />
                <button type="button" className="btn btn-primary btn-sm" onClick={addItem}>Add Item</button>
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <div className="order-summary">
              <div style={{ padding: '0 24px' }}>
                <div className="order-summary-label">Order Items <span>{items.length}</span></div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                        <th style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td data-label="Product" style={{ fontWeight: 600 }}>{item.product_name}</td>
                          <td data-label="Qty">{item.quantity}</td>
                          <td data-label="Price">${item.unit_price.toFixed(2)}</td>
                          <td data-label="Subtotal" style={{ fontWeight: 600 }}>${item.subtotal.toFixed(2)}</td>
                          <td data-label="">
                            <div className="row-actions">
                              <button type="button" className="action-btn delete" onClick={() => removeItem(idx)} title="Remove" style={{ opacity: 1 }}>&#10005;</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="total-bar">
                <span className="total-bar-label">Total</span>
                <span className="total-bar-value">${total.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div style={{ padding: items.length ? '16px 24px 24px' : '24px' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}>
              {submitting ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOrder;
