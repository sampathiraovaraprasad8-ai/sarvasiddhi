import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ClipboardList, Calendar, MapPin, IndianRupee, Clock, Package, Truck, CheckCircle, AlertTriangle, LogIn, ArrowLeft } from 'lucide-react';

export default function MyOrders() {
  const { token, user, API_URL } = useApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/orders/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Error fetching customer orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token, API_URL]);

  // Helper to render tracking steps
  const getStatusStep = (currentStatus) => {
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    return statuses.indexOf(currentStatus); // returns 0, 1, 2, 3 or -1 (Cancelled)
  };

  const steps = [
    { label: 'Confirmed', icon: Clock },
    { label: 'Curating', icon: Package },
    { label: 'Shipped', icon: Truck },
    { label: 'Delivered', icon: CheckCircle }
  ];

  if (!token) {
    return (
      <div className="container animate-fade-in" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-primary)', marginBottom: '20px' }}>
          <ClipboardList size={64} style={{ margin: '0 auto' }} />
        </div>
        <h2 style={{ fontSize: '2.2rem', marginBottom: '10px', color: 'var(--color-primary-dark)', fontFamily: 'var(--font-heading)' }}>My Orders</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px', maxWidth: '500px', margin: '0 auto 30px' }}>
          Log in to your account to access your spiritual purchase history, check active deliveries, and manage past orders.
        </p>
        <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ display: 'inline-flex', gap: '8px' }}>
          <LogIn size={16} /> Log In to Account
        </button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      <div className="section-header" style={{ marginBottom: '40px' }}>
        <h2 className="section-title">My Purchase History</h2>
        <p className="section-subtitle">A collection of spiritual packages saved under your account profile</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>
          Loading your order history...
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          borderRadius: 'var(--border-radius-md)',
          boxShadow: 'var(--shadow-sm)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <ClipboardList size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '15px', margin: '0 auto 15px' }} />
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', marginBottom: '10px' }}>No orders found</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '25px' }}>
            You haven't placed any orders with this profile yet. Explore our sacred catalog to make your first purchase!
          </p>
          <button onClick={() => navigate('/shop')} className="btn btn-primary">
            Browse Spiritual Items
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '35px', maxWidth: '850px', margin: '0 auto' }}>
          {orders.map((order) => {
            const date = new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
            const currentStep = getStatusStep(order.status);
            const isCancelled = order.status === 'Cancelled';

            return (
              <div 
                key={order.id}
                style={{
                  background: 'white',
                  borderRadius: 'var(--border-radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid rgba(226, 168, 43, 0.2)',
                  overflow: 'hidden'
                }}
              >
                {/* Order Card Header */}
                <div style={{
                  backgroundColor: 'rgba(92, 6, 18, 0.03)',
                  padding: '20px 25px',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '15px'
                }}>
                  <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block' }}>Order Placed</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-dark)' }}>{date}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block' }}>Order ID</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>#SRV-100{order.id}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block' }}>Shipping To</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-text-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {order.customer_name}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Total Paid (COD)</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>₹{order.total_amount}</span>
                  </div>
                </div>

                {/* Order Card Body */}
                <div style={{ padding: '25px' }}>
                  
                  {/* Cancelled Warning if applicable */}
                  {isCancelled ? (
                    <div style={{
                      backgroundColor: 'rgba(185,28,28,0.06)',
                      borderLeft: '4px solid var(--color-danger)',
                      padding: '12px 18px',
                      borderRadius: '4px',
                      color: 'var(--color-danger)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '20px'
                    }}>
                      <AlertTriangle size={18} />
                      <span>This order has been cancelled. Please contact support if this was an error.</span>
                    </div>
                  ) : (
                    /* Stepper progress bar inside the order card */
                    <div style={{ marginBottom: '30px', padding: '10px 0' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        position: 'relative',
                        alignItems: 'center'
                      }}>
                        {/* Background connection line */}
                        <div style={{
                          position: 'absolute',
                          left: '15px',
                          right: '15px',
                          height: '4px',
                          backgroundColor: '#e5e7eb',
                          zIndex: 0
                        }} />
                        
                        {/* Foreground active line */}
                        {currentStep >= 0 && (
                          <div style={{
                            position: 'absolute',
                            left: '15px',
                            width: `${(currentStep / (steps.length - 1)) * 95}%`,
                            height: '4px',
                            backgroundColor: 'var(--color-accent)',
                            zIndex: 0,
                            transition: 'width 0.8s ease'
                          }} />
                        )}

                        {/* Nodes */}
                        {steps.map((step, idx) => {
                          const Icon = step.icon;
                          const isDone = idx <= currentStep;
                          const isActive = idx === currentStep;

                          return (
                            <div 
                              key={idx} 
                              style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                zIndex: 1,
                                width: '60px'
                              }}
                            >
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: isDone ? 'var(--color-accent)' : 'white',
                                border: `2px solid ${isDone ? 'var(--color-accent)' : '#d1d5db'}`,
                                color: isDone ? 'var(--color-primary-dark)' : '#9ca3af',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                boxShadow: isActive ? '0 0 0 4px rgba(226, 168, 43, 0.25)' : 'none'
                              }}>
                                <Icon size={14} />
                              </div>
                              <span style={{
                                fontSize: '0.75rem',
                                fontWeight: isDone ? 'bold' : 'normal',
                                color: isDone ? 'var(--color-primary-dark)' : '#9ca3af',
                                marginTop: '6px',
                                whiteSpace: 'nowrap'
                              }}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Items purchased grid list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {order.items.map((item, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          paddingBottom: '12px',
                          borderBottom: idx === order.items.length - 1 ? 'none' : '1px dashed rgba(0,0,0,0.06)'
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.95rem', display: 'block' }}>
                            {item.title}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            Price: ₹{item.price} • Quantity: {item.quantity}
                          </span>
                        </div>
                        <span style={{ fontWeight: 'bold', color: 'var(--color-text-dark)', fontSize: '0.95rem' }}>
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
