import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getOrder } from '../services/api';

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOrder(id)
      .then((res) => setOrder(res.data))
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div>
        <Link to="/orders" className="btn btn-ghost" style={{ marginBottom: 20 }}>← Back to Orders</Link>
        <div className="spinner"><div className="spinner-ring"></div></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <Link to="/orders" className="btn btn-ghost" style={{ marginBottom: 20 }}>← Back to Orders</Link>
        <div className="empty-state"><p>Order not found</p></div>
      </div>
    );
  }

  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <Link to="/orders" className="btn btn-ghost" style={{ marginBottom: 20 }}>← Back to Orders</Link>

      <div className="detail-header">
        <div className="detail-title-area">
          <h1>Order <span style={{ color: 'var(--primary)' }}>#{order.id}</span></h1>
          <p className="detail-meta">Customer ID: {order.customer_id} &middot; {fmt(order.created_at)}</p>
        </div>
        <div className="detail-total-area">
          <p className="detail-total-label">Total Amount</p>
          <p className="detail-total-value">${order.total_amount.toFixed(2)}</p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Order Items</span>
          <span className="badge badge-indigo">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td data-label="Product" style={{ fontWeight: 600 }}>{item.product_name}</td>
                  <td data-label="Quantity">{item.quantity}</td>
                  <td data-label="Unit Price">${item.unit_price.toFixed(2)}</td>
                  <td data-label="Subtotal" style={{ fontWeight: 600 }}>${item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="total-bar" style={{ justifyContent: 'space-between' }}>
          <span className="total-bar-label">Total</span>
          <span className="total-bar-value">${order.total_amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
