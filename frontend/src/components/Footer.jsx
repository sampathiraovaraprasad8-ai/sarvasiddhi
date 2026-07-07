import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Compass } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Store Intro */}
          <div className="footer-column">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={20} /> Sarvasiddhi
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Your one-stop destination for authentic, premium-grade spiritual Pooja Samagri. Empowering your daily rituals, festive celebrations, and spiritual practices with purity and divine blessings.
            </p>
            <div style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--color-accent)' }}>
              \"Purity in product, Devotion in service.\"
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop All Products</Link></li>
              <li><Link to="/wishlist">My Wishlist</Link></li>
              <li><Link to="/cart">My Shopping Cart</Link></li>
              <li><Link to="/track-order">Track My Order</Link></li>
              <li><Link to="/my-orders">My Order History</Link></li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="footer-column">
            <h3>Categories</h3>
            <ul className="footer-links">
              <li><Link to="/shop?category=Pooja Kits">Complete Pooja Kits</Link></li>
              <li><Link to="/shop?category=Spiritual Idols">Spiritual Idols</Link></li>
              <li><Link to="/shop?category=Incense & Fragrances">Incense & Fragrances</Link></li>
              <li><Link to="/shop?category=Pooja Essentials">Pooja Essentials</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact details */}
          <div className="footer-column">
            <h3>Contact Us</h3>
            <ul className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                <MapPin size={22} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                <span>Narasannapeta, Srikakulam District, Andhra Pradesh, India</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                <Phone size={18} style={{ color: 'var(--color-accent)' }} />
                <span>+91 83309 07722</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                <Mail size={18} style={{ color: 'var(--color-accent)' }} />
                <span>support@sarvasiddhi.com</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                <svg style={{ color: 'var(--color-accent)', width: '18px', height: '18px', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <a href="https://www.instagram.com/sarvasiddipoojasamagri?utm_source=qr&igsh=MjNsY3RrNGJ4ZGxl" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}>
                  @sarvasiddipoojasamagri
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Sarvasiddhi Pooja Samagri Store. All Rights Reserved. Crafted with devotion.</p>
        </div>
      </div>
    </footer>
  );
}
