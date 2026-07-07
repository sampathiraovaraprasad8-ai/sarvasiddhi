import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Heart, ShoppingCart } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  
  const hasDiscount = product.sale_price !== null && product.sale_price < product.price;
  const displayPrice = hasDiscount ? product.sale_price : product.price;
  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    alert(`${product.title} has been added to your cart!`);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-image-container">
        {/* Sale Badge */}
        {hasDiscount && (
          <span className="product-badge-sale">
            SAVE {Math.round(((product.price - product.sale_price) / product.price) * 100)}%
          </span>
        )}

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlistToggle}
          className="wishlist-btn-toggle"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart size={18} fill={isWishlisted ? '#e2a82b' : 'none'} stroke={isWishlisted ? '#e2a82b' : 'currentColor'} />
        </button>

        {/* Image */}
        <img 
          src={product.image_url} 
          alt={product.title} 
          className="product-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1609137144813-7d7274017b2b?q=80&w=600';
          }}
        />
      </div>

      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-card-title">{product.title}</h3>
        
        {/* Price Row */}
        <div className="product-price-row">
          <span className="price-actual">₹{displayPrice}</span>
          {hasDiscount && <span className="price-original">₹{product.price}</span>}
        </div>

        {/* Action Button */}
        <button 
          onClick={handleAddToCart}
          className={`btn ${isOutOfStock ? 'btn-secondary' : 'btn-primary'} product-btn-add`}
          disabled={isOutOfStock}
          style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
        >
          {isOutOfStock ? 'Out of Stock' : (
            <>
              <ShoppingCart size={16} /> Add to Cart
            </>
          )}
        </button>
      </div>
    </Link>
  );
}
