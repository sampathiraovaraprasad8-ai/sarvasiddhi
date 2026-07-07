import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Heart, ShoppingCart, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API_URL, addToCart, toggleWishlist, isInWishlist } = useApp();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          setError('Product not found or unavailable');
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, API_URL]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>
        Loading sacred item details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.8rem', color: 'var(--color-danger)', marginBottom: '15px' }}>{error || 'Item not found'}</h3>
        <button onClick={() => navigate('/shop')} className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Shop
        </button>
      </div>
    );
  }

  const hasDiscount = product.sale_price !== null && product.sale_price < product.price;
  const displayPrice = hasDiscount ? product.sale_price : product.price;
  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    alert(`${quantity}x ${product.title} added to your cart!`);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    navigate('/cart');
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--color-primary)',
          fontWeight: 600,
          marginBottom: '30px',
          fontSize: '0.95rem'
        }}
      >
        <ArrowLeft size={18} /> Back to previous page
      </button>

      <div className="product-detail-layout">
        {/* Left Column: Image */}
        <div className="detail-image-box">
          <img 
            src={product.image_url} 
            alt={product.title} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1609137144813-7d7274017b2b?q=80&w=600';
            }}
          />
        </div>

        {/* Right Column: Details */}
        <div className="detail-info-box">
          <span className="product-category" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
            {product.category}
          </span>
          <h2 className="detail-title">{product.title}</h2>
          
          <div className="detail-meta">
            <span>Availability: {isOutOfStock ? (
              <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>Out of Stock</span>
            ) : (
              <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>In Stock ({product.stock} items left)</span>
            )}</span>
          </div>

          <div className="detail-price-box">
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
              ₹{displayPrice}
            </span>
            {hasDiscount && (
              <span style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                ₹{product.price}
              </span>
            )}
            {hasDiscount && (
              <span style={{
                backgroundColor: 'var(--color-saffron)',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                padding: '4px 10px',
                borderRadius: '12px',
                marginLeft: '10px'
              }}>
                Save {Math.round(((product.price - product.sale_price) / product.price) * 100)}%
              </span>
            )}
          </div>

          <p className="detail-description">{product.description}</p>

          {!isOutOfStock && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>Select Quantity:</label>
              <div className="quantity-control">
                <button onClick={handleDecrement} className="quantity-btn" disabled={quantity <= 1}>-</button>
                <span className="quantity-display">{quantity}</span>
                <button onClick={handleIncrement} className="quantity-btn" disabled={quantity >= product.stock}>+</button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleAddToCart}
              className={`btn ${isOutOfStock ? 'btn-secondary' : 'btn-primary'}`}
              disabled={isOutOfStock}
              style={{ flexGrow: 1, padding: '14px 28px', fontSize: '1rem' }}
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>

            {!isOutOfStock && (
              <button 
                onClick={handleBuyNow}
                className="btn btn-accent"
                style={{ flexGrow: 1, padding: '14px 28px', fontSize: '1rem' }}
              >
                <ShoppingBag size={18} /> Buy Now
              </button>
            )}

            <button 
              onClick={() => toggleWishlist(product)}
              className="btn btn-secondary"
              style={{ padding: '14px' }}
              title="Add to Wishlist"
            >
              <Heart size={20} fill={isWishlisted ? '#e2a82b' : 'none'} stroke={isWishlisted ? '#e2a82b' : 'var(--color-primary)'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
