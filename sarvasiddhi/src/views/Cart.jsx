import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Cart() {
  const { cart, updateCartQty, removeFromCart, clearCart, API_URL } = useApp();
  const navigate = useNavigate();

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Calculations
  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product.sale_price !== null ? item.product.sale_price : item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const subtotal = getSubtotal();
  const discountAmount = appliedCoupon ? Math.round(subtotal * (appliedCoupon.discount_percentage / 100)) : 0;
  const shippingFee = subtotal > 500 || subtotal === 0 ? 0 : 60;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/offers`);
      if (res.ok) {
        const offers = await res.json();
        const found = offers.find(o => o.code.toUpperCase() === couponCode.trim().toUpperCase() && o.is_active);
        
        if (found) {
          setAppliedCoupon(found);
          setCouponSuccess(`Coupon "${found.code}" applied successfully! You got ${found.discount_percentage}% off.`);
          setCouponError('');
        } else {
          setCouponError('Invalid or expired coupon code');
          setCouponSuccess('');
          setAppliedCoupon(null);
        }
      }
    } catch (err) {
      console.error('Error applying coupon:', err);
      setCouponError('Error connecting to validation server');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handleCheckout = () => {
    // Pack coupon state in navigation state to pass it to the checkout page
    navigate('/checkout', { 
      state: { 
        appliedCoupon: appliedCoupon ? { code: appliedCoupon.code, discount: appliedCoupon.discount_percentage } : null 
      } 
    });
  };

  if (cart.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-primary)', marginBottom: '20px' }}>
          <ShoppingBag size={64} style={{ margin: '0 auto' }} />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--color-primary-dark)' }}>Your shopping cart is empty</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>Add pure Pooja Samagri and spiritual products to begin your prayers.</p>
        <button onClick={() => navigate('/shop')} className="btn btn-primary">
          <ArrowLeft size={16} /> Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      <h2 className="section-title" style={{ marginBottom: '35px' }}>Shopping Cart</h2>

      <div className="cart-layout">
        {/* Left Column: Cart items */}
        <div>
          <div className="cart-items-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '15px', marginBottom: '10px' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>Items in Cart</span>
              <button 
                onClick={() => { if(window.confirm('Clear all items from your cart?')) clearCart(); }} 
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
              >
                Clear Cart
              </button>
            </div>

            {cart.map((item) => {
              const price = item.product.sale_price !== null ? item.product.sale_price : item.product.price;
              return (
                <div key={item.product.id} className="cart-item-row">
                  {/* Image */}
                  <img src={item.product.image_url} alt={item.product.title} className="cart-item-img" />
                  
                  {/* Info */}
                  <div>
                    <h4 className="cart-item-title">{item.product.title}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Category: {item.product.category}</span>
                  </div>

                  {/* Quantity Control */}
                  <div className="quantity-control" style={{ marginBottom: 0, scale: '0.9' }}>
                    <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)} className="quantity-btn">-</button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button onClick={() => updateCartQty(item.product.id, item.quantity + 1)} className="quantity-btn" disabled={item.quantity >= item.product.stock}>+</button>
                  </div>

                  {/* Price */}
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-primary-dark)' }}>
                    ₹{price * item.quantity}
                    {item.quantity > 1 && (
                      <div style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>
                        (₹{price} each)
                      </div>
                    )}
                  </div>

                  {/* Remove */}
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="nav-icon-btn"
                    style={{ color: 'var(--color-danger)' }}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => navigate('/shop')} 
            className="btn btn-secondary" 
            style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} /> Add More Items
          </button>
        </div>

        {/* Right Column: Checkout Panel */}
        <div>
          {/* Apply Coupon Box */}
          <div className="cart-summary-panel" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--color-primary-dark)' }}>Apply Offer Code</h3>
            
            {appliedCoupon ? (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'rgba(22, 163, 74, 0.1)',
                  color: 'var(--color-success)',
                  padding: '10px 15px',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  marginBottom: '10px'
                }}>
                  <span>Code: {appliedCoupon.code} ({appliedCoupon.discount_percentage}% Off)</span>
                  <button onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontWeight: 'bold' }}>Remove</button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{appliedCoupon.description}</p>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Enter Coupon (e.g. DEV20)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="form-input"
                  style={{ textTransform: 'uppercase' }}
                />
                <button type="submit" className="btn btn-primary btn-sm">Apply</button>
              </form>
            )}

            {couponError && <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '8px' }}>{couponError}</p>}
            {couponSuccess && <p style={{ color: 'var(--color-success)', fontSize: '0.85rem', marginTop: '8px' }}>{couponSuccess}</p>}
          </div>

          {/* Cart Summary Totals */}
          <div className="cart-summary-panel">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--color-primary-dark)', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>
              Order Summary
            </h3>

            <div className="summary-row">
              <span style={{ color: 'var(--color-text-muted)' }}>Cart Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{subtotal}</span>
            </div>

            {discountAmount > 0 && (
              <div className="summary-row" style={{ color: 'var(--color-success)' }}>
                <span>Coupon Discount</span>
                <span style={{ fontWeight: 600 }}>-₹{discountAmount}</span>
              </div>
            )}

            <div className="summary-row">
              <span style={{ color: 'var(--color-text-muted)' }}>Shipping Charges</span>
              <span>{shippingFee === 0 ? (
                <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>FREE</span>
              ) : `₹${shippingFee}`}</span>
            </div>

            {shippingFee > 0 && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '-8px', marginBottom: '15px' }}>
                * Add ₹{500 - subtotal} more to qualify for Free Shipping!
              </p>
            )}

            <div className="summary-row summary-total">
              <span>Total Payable</span>
              <span>₹{totalAmount}</span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '15px 0', textAlign: 'center' }}>
              Tax included. Checkout is secured with Cash on Delivery (COD).
            </p>

            <button 
              onClick={handleCheckout} 
              className="btn btn-accent"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', display: 'flex', gap: '8px' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
