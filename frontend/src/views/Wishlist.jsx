import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Heart, ArrowLeft, LogIn } from 'lucide-react';

export default function Wishlist() {
  const { wishlist, token } = useApp();
  const navigate = useNavigate();

  // If not logged in
  if (!token) {
    return (
      <div className="container animate-fade-in" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-primary)', marginBottom: '20px' }}>
          <Heart size={64} style={{ margin: '0 auto' }} />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--color-primary-dark)' }}>My Sacred Wishlist</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>Please log in to your account to view your saved items.</p>
        <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ display: 'inline-flex', gap: '8px' }}>
          <LogIn size={16} /> Log In Here
        </button>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-primary)', marginBottom: '20px' }}>
          <Heart size={64} style={{ margin: '0 auto' }} />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--color-primary-dark)' }}>Your Wishlist is empty</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>Browse through our collections and click the heart icon to save products here.</p>
        <button onClick={() => navigate('/shop')} className="btn btn-primary">
          <ArrowLeft size={16} /> Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      <div className="section-header" style={{ marginBottom: '35px' }}>
        <h2 className="section-title">Saved Items</h2>
        <p className="section-subtitle">A collection of spiritual goods you wish to bring home</p>
      </div>

      <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
        You have saved {wishlist.length} items
      </div>

      <div className="product-grid">
        {wishlist.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
