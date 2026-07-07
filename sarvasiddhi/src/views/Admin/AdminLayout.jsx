import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, ShoppingBag, ClipboardList, Tag, Bell, AlertTriangle, Users } from 'lucide-react';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const { activeNotifications, clearNotifications, markNotificationRead } = useApp();

  const isActive = (path) => location.pathname === path;
  const unreadNotifs = activeNotifications.filter(n => !n.read);

  return (
    <div className="admin-layout animate-fade-in">
      {/* Sidebar navigation */}
      <aside className="admin-sidebar">
        <div style={{ marginBottom: '30px', padding: '0 15px' }}>
          <h3 style={{ color: 'var(--color-accent-light)', fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
            Sarvasiddhi
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Store Administration
          </span>
        </div>

        <ul className="admin-sidebar-menu">
          <li>
            <Link to="/admin/dashboard" className={`sidebar-link ${isActive('/admin/dashboard') ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Dashboard Home
            </Link>
          </li>
          <li>
            <Link to="/admin/products" className={`sidebar-link ${isActive('/admin/products') ? 'active' : ''}`}>
              <ShoppingBag size={18} /> Manage Products
            </Link>
          </li>
          <li>
            <Link to="/admin/orders" className={`sidebar-link ${isActive('/admin/orders') ? 'active' : ''}`}>
              <ClipboardList size={18} /> Manage Orders
              {unreadNotifs.length > 0 && (
                <span className="badge-count" style={{ position: 'relative', top: '0', right: '-10px', display: 'inline-flex' }}>
                  {unreadNotifs.length}
                </span>
              )}
            </Link>
          </li>
          <li>
            <Link to="/admin/offers" className={`sidebar-link ${isActive('/admin/offers') ? 'active' : ''}`}>
              <Tag size={18} /> Manage Offers
            </Link>
          </li>
          <li>
            <Link to="/admin/customers" className={`sidebar-link ${isActive('/admin/customers') ? 'active' : ''}`}>
              <Users size={18} /> Manage Customers
            </Link>
          </li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content">
        {/* Dynamic Notification Banner */}
        {unreadNotifs.length > 0 && (
          <div className="notification-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Bell size={24} style={{ color: 'var(--color-accent-dark)' }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
                  You have {unreadNotifs.length} new customer order{unreadNotifs.length > 1 ? 's' : ''}!
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Latest order placed by: <b>{unreadNotifs[unreadNotifs.length - 1].customer_name}</b> (₹{unreadNotifs[unreadNotifs.length - 1].total_amount} COD)
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => markNotificationRead(unreadNotifs[unreadNotifs.length - 1].id)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                Acknowledge
              </button>
              <button 
                onClick={clearNotifications}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 10px', backgroundColor: 'var(--color-primary-light)' }}
              >
                Dismiss All
              </button>
            </div>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
