import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCustomers, getOrders } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCustomers(), getOrders()])
      .then(([pr, cr, or]) => {
        setStats({ products: pr.data.length, customers: cr.data.length, orders: or.data.length });
        setRecent(or.data.slice(-4).reverse());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const actions = [
    { to: '/products', icon: 'P', title: 'Add Product', desc: 'Create a new inventory item', color: 'violet' },
    { to: '/customers', icon: 'C', title: 'Add Customer', desc: 'Register a new customer', color: 'emerald' },
    { to: '/orders/create', icon: 'O', title: 'Create Order', desc: 'Process a new order', color: 'amber' },
  ];

  const statCards = [
    { label: 'Total Products', value: stats?.products ?? 0, icon: 'P', desc: 'Items in inventory', color: 'violet' },
    { label: 'Total Customers', value: stats?.customers ?? 0, icon: 'C', desc: 'Registered clients', color: 'emerald' },
    { label: 'Total Orders', value: stats?.orders ?? 0, icon: 'O', desc: 'Orders processed', color: 'amber' },
  ];

  const statusColor = (id) => {
    const colors = ['badge-violet', 'badge-emerald', 'badge-amber', 'badge-red'];
    return colors[id % colors.length];
  };

  return (
    <div className="dashboard">
      <div className="dash-welcome">
        <div className="dash-welcome-content">
          <div className="dash-welcome-tag">Overview</div>
          <h1 className="dash-welcome-title">Welcome back</h1>
          <p className="dash-welcome-text">Here's what's happening with your business today.</p>
          <div className="dash-welcome-actions">
            <Link to="/orders/create" className="btn btn-primary">
              <span className="btn-icon">+</span>
              New Order
            </Link>
            <Link to="/products" className="btn btn-secondary">View Inventory</Link>
          </div>
        </div>
        <div className="dash-welcome-graphic">
          <div className="wg-circle wg-c1"></div>
          <div className="wg-circle wg-c2"></div>
          <div className="wg-circle wg-c3"></div>
        </div>
      </div>

      <div className="dash-stats">
        {statCards.map((s, i) => (
          <div className={`dash-stat dash-stat-${s.color}`} key={i}>
            <div className="dash-stat-top">
              <div className={`dash-stat-icon dash-stat-icon-${s.color}`}>{s.icon}</div>
              {!loading && <span className="dash-stat-value">{s.value}</span>}
            </div>
            <div className="dash-stat-label">{s.label}</div>
            <div className="dash-stat-desc">{s.desc}</div>
            {loading && <div className="skeleton" style={{ width: 40, height: 28, marginTop: 4 }}></div>}
          </div>
        ))}
      </div>

      <div className="dash-bottom">
        <div className="dash-card">
          <div className="dash-card-hdr">
            <div>
              <div className="dash-card-title">Quick Actions</div>
              <div className="dash-card-sub">Common tasks and shortcuts</div>
            </div>
          </div>
          <div className="dash-actions">
            {actions.map((a, i) => (
              <Link to={a.to} key={i} className={`dash-action dash-action-${a.color}`}>
                <div className={`dash-action-icon dash-action-icon-${a.color}`}>
                  <span>{a.icon}</span>
                  <svg className="dash-action-arrow" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="dash-action-text">
                  <div className="dash-action-title">{a.title}</div>
                  <div className="dash-action-desc">{a.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-hdr">
            <div>
              <div className="dash-card-title">Recent Orders</div>
              <div className="dash-card-sub">Latest orders placed</div>
            </div>
            <Link to="/orders" className="dash-card-btn">View all</Link>
          </div>
          {loading ? (
            <div className="skeleton" style={{ width: '100%', height: 160, borderRadius: 8 }}></div>
          ) : recent.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">O</div>
              <p>No orders yet</p>
              <Link to="/orders/create" className="btn btn-sm btn-primary">Create your first order</Link>
            </div>
          ) : (
            <div className="dash-recent">
              {recent.map((o) => (
                <Link to={`/orders/${o.id}`} key={o.id} className="dash-recent-item">
                  <div className="dash-recent-left">
                    <span className={`badge ${statusColor(o.id)}`}>#{o.id}</span>
                    <span className="dash-recent-name">{o.customer_name}</span>
                  </div>
                  <div className="dash-recent-right">
                    <span className="dash-recent-amount">${o.total_amount.toFixed(2)}</span>
                    <span className="dash-recent-date">{fmt(o.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
