import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import AdminLayout from './AdminLayout';
import { IndianRupee, ClipboardList, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { token, API_URL } = useApp();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    outOfStockProducts: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Orders
        const orderRes = await fetch(`${API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const orders = orderRes.ok ? await orderRes.json() : [];

        // Fetch Products
        const prodRes = await fetch(`${API_URL}/api/products`);
        const products = prodRes.ok ? await prodRes.json() : [];

        // Calculations
        const completedOrders = orders.filter(o => o.status !== 'Cancelled');
        const sales = completedOrders.reduce((sum, o) => sum + o.total_amount, 0);
        const pending = orders.filter(o => o.status === 'Pending').length;
        const outOfStock = products.filter(p => p.stock <= 0).length;

        setStats({
          totalSales: Math.round(sales),
          totalOrders: orders.length,
          pendingOrders: pending,
          outOfStockProducts: outOfStock
        });

        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, API_URL]);

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>
          Loading admin analytical stats...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary-dark)', margin: 0 }}>Administrative Dashboard</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: '5px 0 0 0' }}>Real-time statistics of Sarvasiddhi Pooja Samagri Store</p>
      </div>

      {/* Metrics Grid */}
      <div className="admin-stats-grid">
        {/* Total Sales */}
        <div className="admin-stat-card">
          <div>
            <span className="stat-label">Total Revenue</span>
            <div className="stat-value" style={{ display: 'flex', alignItems: 'center' }}>
              ₹{stats.totalSales}
            </div>
          </div>
          <div style={{ padding: '10px', background: 'rgba(22, 163, 74, 0.1)', color: 'var(--color-success)', borderRadius: '50%' }}>
            <IndianRupee size={24} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="admin-stat-card accent">
          <div>
            <span className="stat-label">Total Orders</span>
            <div className="stat-value">{stats.totalOrders}</div>
          </div>
          <div style={{ padding: '10px', background: 'rgba(226, 168, 43, 0.1)', color: 'var(--color-accent-dark)', borderRadius: '50%' }}>
            <ClipboardList size={24} />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="admin-stat-card" style={{ borderLeftColor: 'var(--color-warning)' }}>
          <div>
            <span className="stat-label">Pending Orders</span>
            <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{stats.pendingOrders}</div>
          </div>
          <div style={{ padding: '10px', background: 'rgba(180, 83, 9, 0.1)', color: 'var(--color-warning)', borderRadius: '50%' }}>
            <AlertCircle size={24} />
          </div>
        </div>

        {/* Out of Stock Products */}
        <div className="admin-stat-card" style={{ borderLeftColor: 'var(--color-danger)' }}>
          <div>
            <span className="stat-label">Out of Stock</span>
            <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{stats.outOfStockProducts}</div>
          </div>
          <div style={{ padding: '10px', background: 'rgba(185, 28, 28, 0.1)', color: 'var(--color-danger)', borderRadius: '50%' }}>
            <ShoppingBag size={24} />
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div style={{ background: 'white', borderRadius: 'var(--border-radius-md)', padding: '25px', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '15px' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', margin: 0 }}>Recent Orders</h3>
          <button 
            onClick={() => navigate('/admin/orders')} 
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}
          >
            View All Orders <ArrowRight size={14} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>No customer orders received yet.</p>
        ) : (
          <div className="admin-table-container" style={{ boxShadow: 'none', margin: 0 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Order Date</th>
                  <th>Items Quantity</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const qty = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  return (
                    <tr key={order.id} onClick={() => navigate('/admin/orders')} style={{ cursor: 'pointer' }}>
                      <td style={{ fontWeight: 'bold' }}>#SRV-100{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>{date}</td>
                      <td>{qty} items</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{order.total_amount}</td>
                      <td>
                        <span className={`badge-status ${order.status.toLowerCase()}`}>{order.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
