import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import AdminLayout from './AdminLayout';
import { Plus, Trash2, Edit2, X, Tag } from 'lucide-react';

export default function Offers() {
  const { token, API_URL } = useApp();
  
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    id: null,
    code: '',
    discount_percentage: '',
    description: '',
    is_active: true
  });

  const loadOffers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/offers`);
      if (response.ok) {
        const data = await response.json();
        setOffers(data);
      }
    } catch (err) {
      console.error('Error loading offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, [API_URL]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOpenAddForm = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      code: '',
      discount_percentage: '',
      description: '',
      is_active: true
    });
    setFormOpen(true);
  };

  const handleOpenEditForm = (offer) => {
    setIsEditing(true);
    setFormData({
      id: offer.id,
      code: offer.code,
      discount_percentage: offer.discount_percentage,
      description: offer.description,
      is_active: offer.is_active
    });
    setFormOpen(true);
  };

  const handleCancelForm = () => {
    setFormOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discount_percentage) {
      alert('Please fill in Coupon Code and Discount Percentage');
      return;
    }

    const payload = {
      code: formData.code.toUpperCase(),
      discount_percentage: parseInt(formData.discount_percentage),
      description: formData.description,
      is_active: formData.is_active
    };

    try {
      const url = isEditing 
        ? `${API_URL}/api/offers/${formData.id}` 
        : `${API_URL}/api/offers`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(isEditing ? 'Coupon updated successfully' : 'Coupon created successfully');
        setFormOpen(false);
        loadOffers();
      } else {
        const err = await res.json();
        alert(err.error || 'Operation failed');
      }
    } catch (e) {
      console.error('Error submitting offer form:', e);
      alert('Network error submitting coupon details');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/offers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Coupon deleted successfully');
        loadOffers();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete coupon');
      }
    } catch (e) {
      console.error('Error deleting offer:', e);
      alert('Network error deleting coupon');
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary-dark)', margin: 0 }}>Promotions & Coupons</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: '5px 0 0 0' }}>Manage store discount coupon codes and active homepage banner offers</p>
        </div>
        {!formOpen && (
          <button onClick={handleOpenAddForm} className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
            <Plus size={18} /> Add Coupon Code
          </button>
        )}
      </div>

      {/* Form Card (Add/Edit Coupon) */}
      {formOpen && (
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: 'var(--border-radius-md)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid rgba(226, 168, 43, 0.3)',
          marginBottom: '40px'
        }} className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '15px', marginBottom: '25px' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', margin: 0 }}>
              {isEditing ? `Edit Coupon: ${formData.code}` : 'Create New Coupon'}
            </h3>
            <button onClick={handleCancelForm} className="nav-icon-btn" style={{ color: 'var(--color-text-muted)' }}><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
              <div className="form-group">
                <label className="form-label">Coupon Code *</label>
                <input 
                  type="text" 
                  name="code" 
                  value={formData.code} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  placeholder="e.g. POOJA30" 
                  style={{ textTransform: 'uppercase' }}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Discount Percentage *</label>
                <input 
                  type="number" 
                  name="discount_percentage" 
                  value={formData.discount_percentage} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  placeholder="e.g. 30" 
                  min="1"
                  max="100"
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Coupon Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                className="form-input" 
                rows="2" 
                placeholder="e.g. 30% off on all brass items for Navratri celebrations!" 
                style={{ resize: 'none' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input 
                type="checkbox" 
                name="is_active" 
                id="is_active"
                checked={formData.is_active} 
                onChange={handleInputChange}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
              <label htmlFor="is_active" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-primary-dark)', cursor: 'pointer' }}>
                Coupon is active & ready for customer checkout validation
              </label>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '20px', marginTop: '20px' }}>
              <button type="button" onClick={handleCancelForm} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-accent">{isEditing ? 'Save Changes' : 'Create Offer'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>Loading coupons...</div>
      ) : offers.length === 0 ? (
        <div style={{ background: 'white', padding: '40px', borderRadius: 'var(--border-radius-md)', textAlign: 'center' }}>No active discount coupons found.</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount Percentage</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id}>
                  <td style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-dark)' }}>
                    <Tag size={16} style={{ color: 'var(--color-accent-dark)' }} /> <span>{offer.code}</span>
                  </td>
                  <td style={{ fontWeight: 'bold', color: 'var(--color-success)', fontSize: '1.1rem' }}>
                    {offer.discount_percentage}% OFF
                  </td>
                  <td>{offer.description}</td>
                  <td>
                    {offer.is_active ? (
                      <span className="badge-status delivered">Active</span>
                    ) : (
                      <span className="badge-status cancelled">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => handleOpenEditForm(offer)} 
                        className="nav-icon-btn" 
                        style={{ color: 'var(--color-accent-dark)' }}
                        title="Edit coupon"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(offer.id, offer.code)} 
                        className="nav-icon-btn" 
                        style={{ color: 'var(--color-danger)' }}
                        title="Delete coupon"
                      >
                        <Trash2 size={16} />
                      </button>
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
