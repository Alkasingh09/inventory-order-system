import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'D' },
  { path: '/products', label: 'Products', icon: 'P' },
  { path: '/customers', label: 'Customers', icon: 'C' },
  { path: '/orders', label: 'Orders', icon: 'O' },
];

function Sidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
        <span className={`hamburger ${open ? 'open' : ''}`}>
          <span></span><span></span><span></span>
        </span>
      </button>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)}></div>}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand" onClick={() => setOpen(false)}>
            <span className="sidebar-brand-icon">IMS</span>
            <span>InventoryMS</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className={`sidebar-link-icon ${isActive(item.path) ? 'active' : ''}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-avatar">A</div>
          <div className="sidebar-footer-info">
            <div className="sidebar-footer-name">Admin User</div>
            <div className="sidebar-footer-email">admin@example.com</div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
