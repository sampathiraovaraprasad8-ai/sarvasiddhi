import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import AdminLayout from './AdminLayout';
import { Users, Mail, ShieldAlert, Calendar } from 'lucide-react';

export default function Customers() {
  const { token, API_URL } = useApp();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCustomers(data);
        }
      } catch (err) {
        console.error('Error fetching registered customers:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, [API_URL, token]);

  return (
    <AdminLayout>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={28} /> Customer Directory
        </h2>
        <p style={{ color: 'var(--color-text-muted)', margin: '5px 0 0 0' }}>View all registered client accounts and administrative coordinators</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>Loading directory...</div>
      ) : customers.length === 0 ? (
        <div style={{ background: 'white', padding: '40px', borderRadius: 'var(--border-radius-md)', textAlign: 'center' }}>No users found.</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Account ID</th>
                <th>Name</th>
                <th>Email Address</th>
                <th>Account Role</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust) => (
                <tr key={cust.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>#{cust.id}</td>
                  <td>
                    <div style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', fontSize: '1rem' }}>
                      {cust.name}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-dark)' }}>
                      <Mail size={14} style={{ color: 'var(--color-accent-dark)' }} />
                      <a href={`mailto:${cust.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {cust.email}
                      </a>
                    </div>
                  </td>
                  <td>
                    {cust.role === 'admin' ? (
                      <span style={{ 
                        backgroundColor: 'rgba(92, 6, 18, 0.08)', 
                        color: 'var(--color-primary)', 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '0.8rem', 
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <ShieldAlert size={12} /> Administrator
                      </span>
                    ) : (
                      <span style={{ 
                        backgroundColor: '#f3f4f6', 
                        color: '#4b5563', 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}>
                        Customer
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                      <Calendar size={14} />
                      {new Date(cust.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
