import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import AdminLayout from './AdminLayout';
import { ClipboardList, Eye, Check, X, Phone, Mail, MapPin, Tag } from 'lucide-react';

export default function Orders() {
  const { token, API_URL, activeNotifications, clearNotifications } = useApp();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error loading orders in admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [API_URL]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        alert(`Order status updated to: ${newStatus}`);
        loadOrders();
        // Update selected order details view if open
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updatedOrder);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Network error updating status');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary-dark)', margin: 0 }}>Customer Orders</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: '5px 0 0 0' }}>Process customer purchases, track shipments, and manage COD updates</p>
        </div>
        {activeNotifications.length > 0 && (
          <button 
            onClick={clearNotifications} 
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--color-accent-dark)', borderColor: 'var(--color-accent)' }}
          >
            Clear Notifications
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1.5fr 1fr' : '1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Grid: Orders List Table */}
        <div className="admin-table-container" style={{ margin: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No customer orders placed yet.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Order Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });
                  const isSelected = selectedOrder && selectedOrder.id === order.id;
                  return (
                    <tr key={order.id} style={{ backgroundColor: isSelected ? 'rgba(226, 168, 43, 0.05)' : 'inherit' }}>
                      <td style={{ fontWeight: 'bold' }}>#SRV-100{order.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{order.customer_phone}</div>
                      </td>
                      <td>{date}</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{order.total_amount}</td>
                      <td>
                        <span className={`badge-status ${order.status.toLowerCase()}`}>{order.status}</span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleViewDetails(order)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', fontSize: '0.8rem' }}
                        >
                          <Eye size={14} /> View details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right Grid: Order Details Detail Card */}
        {selectedOrder && (
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: 'var(--border-radius-md)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid rgba(226, 168, 43, 0.3)'
          }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-dark)', margin: 0 }}>
                Details: #SRV-100{selectedOrder.id}
              </h3>
              <button onClick={handleCloseDetails} className="nav-icon-btn" style={{ color: 'var(--color-text-muted)' }}><X size={20} /></button>
            </div>

            {/* Status controller drop down */}
            <div style={{ marginBottom: '25px', backgroundColor: 'rgba(92, 6, 18, 0.03)', padding: '15px', borderRadius: 'var(--border-radius-sm)', borderLeft: '3px solid var(--color-primary)' }}>
              <label className="form-label" style={{ marginBottom: '8px' }}>Update Shipping Status:</label>
              <select 
                value={selectedOrder.status} 
                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                className="form-input"
                style={{ fontWeight: 600 }}
              >
                <option value="Pending">Pending (Awaiting Confirmation)</option>
                <option value="Processing">Processing (Packaging items)</option>
                <option value="Shipped">Shipped (In transit)</option>
                <option value="Delivered">Delivered (Completed)</option>
                <option value="Cancelled">Cancelled (Terminated)</option>
              </select>
            </div>

            {/* Customer Details */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '0.95rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '5px', marginBottom: '10px', color: 'var(--color-primary-dark)' }}>Customer Information</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} style={{ color: 'var(--color-accent-dark)' }} /> <span>{selectedOrder.customer_phone}</span>
                </li>
                {selectedOrder.customer_email && (
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} style={{ color: 'var(--color-accent-dark)' }} /> <span>{selectedOrder.customer_email}</span>
                  </li>
                )}
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <MapPin size={14} style={{ color: 'var(--color-accent-dark)', marginTop: '3px', flexShrink: 0 }} /> 
                  <span style={{ lineHeight: '1.4' }}>{selectedOrder.customer_address}</span>
                </li>
              </ul>
            </div>

            {/* Items Ordered List */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '5px', marginBottom: '10px', color: 'var(--color-primary-dark)' }}>Ordered Items</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px dashed rgba(0,0,0,0.05)', paddingBottom: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>{item.title}</div>
                      <span style={{ color: 'var(--color-text-muted)' }}>₹{item.price} x {item.quantity}</span>
                    </div>
                    <span style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Summary */}
            <div style={{ borderTop: '2px solid rgba(0,0,0,0.08)', paddingTop: '15px' }}>
              {selectedOrder.coupon_code && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-success)', marginBottom: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Tag size={12} /> Coupon Code</span>
                  <span>{selectedOrder.coupon_code}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-primary-dark)' }}>
                <span>Final Total (COD)</span>
                <span>₹{selectedOrder.total_amount}</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  );
}
