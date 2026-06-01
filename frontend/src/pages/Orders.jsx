import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getOrders } from '../services/api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    getOrders().then((r) => setOrders(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => o.customer_name.toLowerCase().includes(search.toLowerCase()) || String(o.id).includes(search));

  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p>View and manage customer orders</p>
        </div>
        <Link to="/orders/create" className="btn btn-primary">New Order</Link>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-wrap">
            <input className="search-input" type="text" placeholder="Search by ID or customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span className="result-count">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th style={{ width: 70 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6"><div className="spinner"><div className="spinner-ring"></div></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6"><div className="empty-state"><p>{search ? 'No matches found' : 'No orders yet'}</p></div></td></tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id}>
                    <td data-label="Order"><span className="badge badge-indigo">#{o.id}</span></td>
                    <td data-label="Customer" style={{ fontWeight: 500 }}>{o.customer_name}</td>
                    <td data-label="Items">{o.item_count ?? o.items?.length ?? '-'}</td>
                    <td data-label="Total" style={{ fontWeight: 600 }}>${o.total_amount.toFixed(2)}</td>
                    <td data-label="Date" style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>{fmt(o.created_at)}</td>
                    <td data-label="">
                      <Link to={`/orders/${o.id}`} className="btn btn-sm btn-secondary">View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Orders;
