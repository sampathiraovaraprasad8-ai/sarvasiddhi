import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CheckCircle, Truck, Package, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Checkout() {
  const { cart, token, user, clearCart, API_URL } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve coupon passed from Cart page
  const appliedCoupon = location.state?.appliedCoupon || null;

  // Checkout Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);

  // Calculations
  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product.sale_price !== null ? item.product.sale_price : item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const subtotal = getSubtotal();
  const discountAmount = appliedCoupon ? Math.round(subtotal * (appliedCoupon.discount / 100)) : 0;
  const shippingFee = subtotal > 500 ? 0 : 60;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.postalCode) {
      alert('Please fill in all shipping details');
      return;
    }

    setIsSubmitting(true);

    const orderItems = cart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.sale_price !== null ? item.product.sale_price : item.product.price
    }));

    const orderPayload = {
      customer_name: formData.name,
      customer_email: formData.email,
      customer_phone: formData.phone,
      customer_address: `${formData.address}, ${formData.city} - ${formData.postalCode}`,
      items: orderItems,
      total_amount: totalAmount,
      coupon_code: appliedCoupon ? appliedCoupon.code : null
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const orderData = await res.json();
        setOrderSuccess(orderData);
        clearCart();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error('Error placing checkout order:', err);
      alert('Network error placing order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="container animate-fade-in" style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '600px' }}>
        <div style={{ color: 'var(--color-success)', marginBottom: '20px' }}>
          <CheckCircle size={72} style={{ margin: '0 auto' }} />
        </div>
        <h2 style={{ fontSize: '2.2rem', marginBottom: '10px', color: 'var(--color-primary-dark)' }}>Order Confirmed!</h2>
        <h4 style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>
          Thank you for shopping at Sarvasiddhi. Your order has been registered successfully.
        </h4>

        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: 'var(--border-radius-md)',
          boxShadow: 'var(--shadow-sm)',
          textAlign: 'left',
          marginBottom: '35px',
          border: '1px solid rgba(226, 168, 43, 0.2)'
        }}>
          <p style={{ marginBottom: '8px' }}><b>Order ID:</b> #SRV-100{orderSuccess.id}</p>
          <p style={{ marginBottom: '8px' }}><b>Recipient:</b> {orderSuccess.customer_name}</p>
          <p style={{ marginBottom: '8px' }}><b>Phone:</b> {orderSuccess.customer_phone}</p>
          <p style={{ marginBottom: '8px' }}><b>Address:</b> {orderSuccess.customer_address}</p>
          <p style={{ marginBottom: '8px' }}><b>Total Paid (COD):</b> ₹{orderSuccess.total_amount}</p>
          <p style={{ marginBottom: '0', color: 'var(--color-warning)', fontWeight: 600 }}>
            Payment Method: Cash on Delivery
          </p>
        </div>

        <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px', fontSize: '0.95rem' }}>
          Our spiritual curators are preparing your items. You will receive updates as status progresses.
        </p>

        <button onClick={() => navigate('/shop')} className="btn btn-primary" style={{ padding: '12px 30px' }}>
          Continue Shopping
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: 'var(--color-primary-dark)' }}>No items in cart to checkout</h2>
        <button onClick={() => navigate('/shop')} className="btn btn-primary">Return to shop</button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      <h2 className="section-title" style={{ marginBottom: '35px' }}>Checkout</h2>

      <div className="cart-layout">
        {/* Left Column: Form */}
        <div style={{ background: 'white', padding: '30px', borderRadius: 'var(--border-radius-md)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '25px', color: 'var(--color-primary-dark)', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '10px' }}>
            Delivery Details (Cash on Delivery)
          </h3>

          <form onSubmit={handleSubmitOrder}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                className="form-input" 
                placeholder="Lord Ganesh" 
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Email Address (Optional)</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  placeholder="name@domain.com" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  placeholder="9876543210" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Street Address *</label>
              <textarea 
                name="address" 
                value={formData.address} 
                onChange={handleInputChange} 
                className="form-input" 
                rows="3" 
                placeholder="House No, Building, Street details" 
                style={{ resize: 'none' }}
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  placeholder="New Delhi" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">PIN / Postal Code *</label>
                <input 
                  type="text" 
                  name="postalCode" 
                  value={formData.postalCode} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  placeholder="110001" 
                  required 
                />
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(226, 168, 43, 0.08)',
              border: '1px solid rgba(226, 168, 43, 0.3)',
              padding: '20px',
              borderRadius: 'var(--border-radius-sm)',
              marginTop: '30px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <Truck style={{ color: 'var(--color-accent-dark)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '5px' }}>
                  Cash On Delivery Guaranteed
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                  Pay cash at your doorstep upon receiving the package. We do not require credit cards or advanced deposits. Purity delivered risk-free.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <Link to="/cart" className="btn btn-secondary" style={{ flexGrow: 1 }}>
                <ArrowLeft size={16} /> Return to Cart
              </Link>
              <button 
                type="submit" 
                className="btn btn-accent" 
                disabled={isSubmitting} 
                style={{ flexGrow: 2, display: 'flex', gap: '8px' }}
              >
                {isSubmitting ? 'Processing Order...' : (
                  <>
                    Confirm Order (COD) <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <div className="cart-summary-panel">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--color-primary-dark)', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>
              Items Ordered
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '250px', overflowY: 'auto', marginBottom: '20px', paddingRight: '5px' }}>
              {cart.map((item) => {
                const price = item.product.sale_price !== null ? item.product.sale_price : item.product.price;
                return (
                  <div key={item.product.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.9rem' }}>
                    <img src={item.product.image_url} alt={item.product.title} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.05)' }} />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.product.title}</div>
                      <span style={{ color: 'var(--color-text-muted)' }}>Qty: {item.quantity} x ₹{price}</span>
                    </div>
                    <span style={{ fontWeight: 'bold' }}>₹{price * item.quantity}</span>
                  </div>
                );
              })}
            </div>

            <div className="summary-row" style={{ fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Items Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            {discountAmount > 0 && (
              <div className="summary-row" style={{ fontSize: '0.9rem', color: 'var(--color-success)' }}>
                <span>Offer Discount ({appliedCoupon.code})</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            <div className="summary-row" style={{ fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Shipping Charges</span>
              <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
            </div>

            <div className="summary-row summary-total">
              <span>Final Total</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
