import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Heart, User, LogOut, LayoutDashboard, Bell, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout, cart, wishlist, activeNotifications } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const unreadNotificationsCount = activeNotifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="header">
      <div className="container nav-container" style={{ position: 'relative' }}>
        
        {/* Brand Logo */}
        <Link to="/" onClick={closeMobileMenu} className="logo-link" style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1100 }}>
          <img 
            src="/logo.jpg" 
            alt="Sarvasiddhi Logo" 
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '50%', 
              border: '2px solid var(--color-accent)', 
              boxShadow: '0 0 10px rgba(226, 168, 43, 0.4)' 
            }} 
          />
          <div>
            <h1 className="logo-text" style={{ fontSize: '1.4rem', lineHeight: '1.1' }}>SARVASIDDHI</h1>
            <div className="logo-subtext" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Pooja Samagri Store</div>
          </div>
        </Link>

        {/* 1. DESKTOP NAVIGATION (Hidden on mobile via CSS media queries) */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center' }}>
          <ul className="nav-links" style={{ marginRight: '30px' }}>
            <li className="nav-item">
              <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/shop" className={isActive('/shop') ? 'active' : ''}>Shop</Link>
            </li>
            <li className="nav-item">
              <Link to="/track-order" className={isActive('/track-order') ? 'active' : ''}>Track Order</Link>
            </li>
            <li className="nav-item">
              <Link to="/my-orders" className={isActive('/my-orders') ? 'active' : ''}>My Orders</Link>
            </li>
            {user?.role === 'admin' && (
              <li className="nav-item">
                <Link to="/admin/dashboard" className={isActive('/admin/dashboard') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <LayoutDashboard size={16} /> Admin Portal
                </Link>
              </li>
            )}
          </ul>

          <div className="nav-actions">
            {/* Wishlist */}
            <Link to="/wishlist" className="nav-icon-btn" title="Wishlist">
              <Heart size={22} fill={wishlistCount > 0 ? '#e2a82b' : 'none'} stroke={wishlistCount > 0 ? '#e2a82b' : 'currentColor'} />
              {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="nav-icon-btn" title="Cart">
              <ShoppingBag size={22} />
              {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
            </Link>

            {/* Notifications */}
            {user?.role === 'admin' && (
              <Link to="/admin/orders" className="nav-icon-btn" title="Order Notifications">
                <Bell size={22} className={unreadNotificationsCount > 0 ? 'animate-pulse' : ''} style={{ color: unreadNotificationsCount > 0 ? '#e2a82b' : 'inherit' }} />
                {unreadNotificationsCount > 0 && <span className="badge-count">{unreadNotificationsCount}</span>}
              </Link>
            )}

            {/* User Login Details */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '0.9rem', opacity: '0.9', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <User size={16} /> {user.name.split(' ')[0]}
                </span>
                <button onClick={handleLogout} className="nav-icon-btn" title="Logout" style={{ color: '#ff6b6b' }}>
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-accent btn-sm">Login</Link>
            )}
          </div>
        </nav>

        {/* 2. MOBILE ACTIONS HEADER ROW (Only visible on mobile screen widths) */}
        <div className="mobile-header-actions" style={{ display: 'none', alignItems: 'center', gap: '15px', zIndex: 1100 }}>
          {/* Wishlist icon link */}
          <Link to="/wishlist" className="nav-icon-btn" onClick={closeMobileMenu}>
            <Heart size={22} fill={wishlistCount > 0 ? '#e2a82b' : 'none'} stroke={wishlistCount > 0 ? '#e2a82b' : 'currentColor'} />
            {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
          </Link>

          {/* Cart icon link */}
          <Link to="/cart" className="nav-icon-btn" onClick={closeMobileMenu}>
            <ShoppingBag size={22} />
            {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
          </Link>

          {/* Hamburger toggle button */}
          <button 
            onClick={toggleMobileMenu} 
            className="nav-icon-btn"
            style={{ color: 'var(--color-accent)', padding: '5px' }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* 3. MOBILE MENU SLIDE-DOWN DRAWER (Only visible when mobileMenuOpen is true) */}
        <div className={`mobile-menu-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="mobile-menu-links">
            <li><Link to="/" onClick={closeMobileMenu} className={isActive('/') ? 'active' : ''}>Home</Link></li>
            <li><Link to="/shop" onClick={closeMobileMenu} className={isActive('/shop') ? 'active' : ''}>Shop Catalog</Link></li>
            <li><Link to="/track-order" onClick={closeMobileMenu} className={isActive('/track-order') ? 'active' : ''}>Track Order</Link></li>
            <li><Link to="/my-orders" onClick={closeMobileMenu} className={isActive('/my-orders') ? 'active' : ''}>My Orders</Link></li>
            {user?.role === 'admin' && (
              <li>
                <Link to="/admin/dashboard" onClick={closeMobileMenu} className={isActive('/admin/dashboard') ? 'active' : ''} style={{ color: 'var(--color-accent-light)' }}>
                  Admin Portal Dashboard
                </Link>
              </li>
            )}
            
            <li className="mobile-menu-auth-row" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '20px', paddingTop: '20px' }}>
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <span style={{ fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={18} /> Logged in as: <b>{user.name}</b>
                  </span>
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-secondary" 
                    style={{ color: '#ff6b6b', borderColor: '#ff6b6b', width: '100%', display: 'flex', gap: '8px', justifyContent: 'center' }}
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={closeMobileMenu} className="btn btn-accent" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
                  Login / Register
                </Link>
              )}
            </li>
          </ul>
        </div>

      </div>
    </header>
  );
}
