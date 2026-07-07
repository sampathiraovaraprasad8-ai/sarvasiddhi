import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, Package, Clock, Truck, CheckCircle, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function OrderTracking() {
  const { token, API_URL, user } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tracking inputs
  const [orderIdInput, setOrderIdInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);

  // Authenticated user history
  const [userOrders, setUserOrders] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Read URL query param if user clicked a link
  const orderIdParam = searchParams.get('id');

  const fetchTrackedOrder = async (id) => {
    if (!id) return;
    setTrackLoading(true);
    setTrackError('');
    setTrackedOrder(null);
    
    // Clean id (if user entered #SRV-1001 or SRV-1001 or 1)
    let cleanId = id.toString().replace(/#?SRV-1000*/i, '').trim();
    if (isNaN(cleanId) || cleanId === '') {
      setTrackError('Please enter a valid numeric Order ID (e.g. 1 or #SRV-1001)');
      setTrackLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/orders/track/${cleanId}`);
      if (res.ok) {
        const data = await res.json();
        setTrackedOrder(data);
      } else {
        const err = await res.json();
        setTrackError(err.error || 'Order not found');
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setTrackError('Error connecting to tracking server');
    } finally {
      setTrackLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    if (!token) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserOrders(data);
      }
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Run on mount or query change
  useEffect(() => {
    if (orderIdParam) {
      setOrderIdInput(orderIdParam);
      fetchTrackedOrder(orderIdParam);
    }
  }, [orderIdParam]);

  useEffect(() => {
    fetchUserOrders();
  }, [token]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;
    setSearchParams({ id: orderIdInput.trim() });
    fetchTrackedOrder(orderIdInput.trim());
  };

  const handleTrackHistoryItem = (id) => {
    setSearchParams({ id: id.toString() });
    setOrderIdInput(`#SRV-100${id}`);
    fetchTrackedOrder(id);
  };

  // Helper to render tracking steps
  const getStatusStep = (currentStatus) => {
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const idx = statuses.indexOf(currentStatus);
    
    if (currentStatus === 'Cancelled') return -1; // Special error step
    return idx; // returns 0, 1, 2, 3
  };

  const currentStep = trackedOrder ? getStatusStep(trackedOrder.status) : -1;

  const stepsDetails = [
    { title: 'Order Received', desc: 'Awaiting curation confirmation', icon: Clock },
    { title: 'Being Curated', desc: 'Assembling pure ritual items & packing', icon: Package },
    { title: 'In Transit', desc: 'Handed to shipment courier', icon: Truck },
    { title: 'Delivered', desc: 'Arrived at your mandir / destination', icon: CheckCircle }
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      <div className="section-header" style={{ marginBottom: '35px' }}>
        <h2 className="section-title">Track Sacred Order</h2>
        <p className="section-subtitle">Follow your spiritual shipment from our altar to your home</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: token ? '1.5fr 1fr' : '1fr', gap: '40px', alignItems: 'start' }}>
        
        {/* Left Column: Search & Timeline */}
        <div>
          {/* Tracking Form */}
          <div style={{ background: 'white', padding: '30px', borderRadius: 'var(--border-radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(226, 168, 43, 0.2)', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--color-primary-dark)' }}>Track Guest Order</h3>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flexGrow: 1, position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Enter Order ID (e.g. #SRV-1001 or 1)" 
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '45px' }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={trackLoading}>
                {trackLoading ? 'Searching...' : 'Track Order'}
              </button>
            </form>

            {trackError && (
              <div style={{
                marginTop: '15px',
                padding: '10px 15px',
                backgroundColor: 'rgba(185,28,28,0.06)',
                border: '1px solid var(--color-danger)',
                color: 'var(--color-danger)',
                fontSize: '0.85rem',
                borderRadius: '4px',
                fontWeight: 500
              }}>
                ⚠️ {trackError}
              </div>
            )}
          </div>

          {/* Timeline Output */}
          {trackedOrder && (
            <div style={{ background: 'white', padding: '35px', borderRadius: 'var(--border-radius-md)', boxShadow: 'var(--shadow-sm)' }} className="animate-fade-in">
              
              {/* Order Header Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '20px', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Identifier</span>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', margin: 0 }}>#SRV-100{trackedOrder.id}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Plurality: {new Date(trackedOrder.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>Total Paid via COD</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>₹{trackedOrder.total_amount}</span>
                </div>
              </div>

              {/* Cancelled Alert if order cancelled */}
              {trackedOrder.status === 'Cancelled' ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  backgroundColor: 'rgba(185, 28, 28, 0.08)',
                  color: 'var(--color-danger)',
                  padding: '20px',
                  borderRadius: 'var(--border-radius-sm)',
                  borderLeft: '5px solid var(--color-danger)',
                  marginBottom: '20px'
                }}>
                  <AlertTriangle size={32} />
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 'bold' }}>Order Terminated / Cancelled</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>This order has been cancelled by the store administrator. Please contact customer support for further assistance.</p>
                  </div>
                </div>
              ) : (
                /* Stepper UI */
                <div style={{ marginBottom: '40px' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--color-primary-dark)', marginBottom: '25px', fontWeight: 'bold' }}>Delivery Status Timeline</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', position: 'relative', paddingLeft: '20px' }}>
                    {/* Stepper bar line */}
                    <div style={{
                      position: 'absolute',
                      left: '34px',
                      top: '25px',
                      bottom: '25px',
                      width: '4px',
                      backgroundColor: '#e5e7eb',
                      zIndex: 0
                    }} />

                    {/* Stepper active bar */}
                    {currentStep >= 0 && (
                      <div style={{
                        position: 'absolute',
                        left: '34px',
                        top: '25px',
                        height: `${(currentStep / (stepsDetails.length - 1)) * 100}%`,
                        maxHeight: 'calc(100% - 50px)',
                        width: '4px',
                        backgroundColor: 'var(--color-accent)',
                        zIndex: 0,
                        transition: 'height 0.8s ease'
                      }} />
                    )}

                    {/* Steps Nodes */}
                    {stepsDetails.map((step, idx) => {
                      const Icon = step.icon;
                      const isCompleted = idx <= currentStep;
                      const isActive = idx === currentStep;

                      return (
                        <div key={idx} style={{ display: 'flex', gap: '20px', alignItems: 'center', zIndex: 1 }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? 'var(--color-accent)' : '#fff',
                            border: `2px solid ${isCompleted ? 'var(--color-accent)' : '#d1d5db'}`,
                            color: isCompleted ? 'var(--color-primary-dark)' : '#9ca3af',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            boxShadow: isActive ? '0 0 0 4px rgba(226, 168, 43, 0.3)' : 'none'
                          }}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <h4 style={{
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              color: isCompleted ? 'var(--color-primary-dark)' : 'var(--color-text-muted)'
                            }}>
                              {step.title}
                            </h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items Summary list */}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--color-primary-dark)', marginBottom: '15px', fontWeight: 'bold' }}>Items Included</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {trackedOrder.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--color-primary-dark)' }}>
                        {item.title} <span style={{ color: 'var(--color-text-muted)' }}>x {item.quantity}</span>
                      </span>
                      <span style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Right Column: Authenticated Order History List */}
        {token && (
          <div style={{ background: 'white', padding: '30px', borderRadius: 'var(--border-radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(92,6,18,0.05)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--color-primary-dark)', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '10px' }}>
              My Order History
            </h3>

            {historyLoading ? (
              <p style={{ textAlign: 'center', padding: '15px', color: 'var(--color-text-muted)' }}>Loading orders...</p>
            ) : userOrders.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>You haven't placed any orders yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {userOrders.map((order) => {
                  const date = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                  return (
                    <div 
                      key={order.id}
                      onClick={() => handleTrackHistoryItem(order.id)}
                      style={{
                        padding: '15px',
                        border: '1px solid rgba(0,0,0,0.06)',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      className="history-item-hover"
                    >
                      <div>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-primary-dark)', display: 'block' }}>
                          #SRV-100{order.id}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          Placed on: {date} • ₹{order.total_amount}
                        </span>
                      </div>
                      <span className={`badge-status ${order.status.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                        {order.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
