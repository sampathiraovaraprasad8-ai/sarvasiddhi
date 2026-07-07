import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import AdminLayout from './AdminLayout';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export default function Products() {
  const { token, API_URL } = useApp();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form Fields State
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    category: 'Pooja Kits',
    price: '',
    sale_price: '',
    image_url: '',
    stock: ''
  });

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error loading products in admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [API_URL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAddForm = () => {
    setIsEditing(false);
    setIsNewCategory(false);
    setNewCategoryName('');
    const defaultCat = categories.length > 0 ? categories[0] : 'Pooja Kits';
    setFormData({
      id: null,
      title: '',
      description: '',
      category: defaultCat,
      price: '',
      sale_price: '',
      image_url: '',
      stock: ''
    });
    setFormOpen(true);
  };

  const handleOpenEditForm = (prod) => {
    setIsEditing(true);
    setIsNewCategory(false);
    setNewCategoryName('');
    setFormData({
      id: prod.id,
      title: prod.title,
      description: prod.description,
      category: prod.category,
      price: prod.price,
      sale_price: prod.sale_price !== null ? prod.sale_price : '',
      image_url: prod.image_url,
      stock: prod.stock
    });
    setFormOpen(true);
  };

  const handleCancelForm = () => {
    setFormOpen(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataPayload = new FormData();
    formDataPayload.append('image', file);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataPayload
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, image_url: data.url }));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Network error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.stock) {
      alert('Please fill in Title, Price, and Stock');
      return;
    }

    const finalCategory = isNewCategory ? newCategoryName.trim() : formData.category;
    if (!finalCategory) {
      alert('Please select or enter a category name');
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      category: finalCategory,
      price: parseFloat(formData.price),
      sale_price: formData.sale_price !== '' ? parseFloat(formData.sale_price) : null,
      image_url: formData.image_url,
      stock: parseInt(formData.stock)
    };

    try {
      const url = isEditing 
        ? `${API_URL}/api/products/${formData.id}` 
        : `${API_URL}/api/products`;
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
        alert(isEditing ? 'Product updated successfully' : 'Product created successfully');
        setFormOpen(false);
        loadProducts();
      } else {
        const err = await res.json();
        alert(err.error || 'Operation failed');
      }
    } catch (e) {
      console.error('Error submitting product form:', e);
      alert('Network error submitting product details');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete product "${title}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Product deleted successfully');
        loadProducts();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete product');
      }
    } catch (e) {
      console.error('Error deleting product:', e);
      alert('Network error deleting product');
    }
  };

  const categories = products.length > 0 
    ? [...new Set(products.map(p => p.category))] 
    : ['Pooja Kits', 'Spiritual Idols', 'Incense & Fragrances', 'Pooja Essentials'];

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary-dark)', margin: 0 }}>Product Catalog</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: '5px 0 0 0' }}>Add, update, or remove spiritual catalog items</p>
        </div>
        {!formOpen && (
          <button onClick={handleOpenAddForm} className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
            <Plus size={18} /> Add New Product
          </button>
        )}
      </div>

      {/* Form Card (Add/Edit) */}
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
              {isEditing ? `Edit Product: ${formData.title}` : 'Add New Product'}
            </h3>
            <button onClick={handleCancelForm} className="nav-icon-btn" style={{ color: 'var(--color-text-muted)' }}><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
              
              {/* Left Column Fields */}
              <div>
                <div className="form-group">
                  <label className="form-label">Product Title *</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    placeholder="e.g. Pure Sandalwood Agarbatti" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Product Description</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    rows="4" 
                    placeholder="Provide spiritual context, ingredients, size details..." 
                    style={{ resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label className="form-label" style={{ margin: 0 }}>Category *</label>
                      <button 
                        type="button" 
                        onClick={() => setIsNewCategory(prev => !prev)}
                        style={{ border: 'none', background: 'none', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {isNewCategory ? 'Choose Existing' : '+ Add New Category'}
                      </button>
                    </div>
                    {isNewCategory ? (
                      <input 
                        type="text" 
                        placeholder="Enter new category name..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="form-input"
                        required
                      />
                    ) : (
                      <select 
                        name="category" 
                        value={formData.category} 
                        onChange={handleInputChange} 
                        className="form-input"
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Image File</label>
                    <input 
                      type="file" 
                      onChange={handleImageUpload} 
                      className="form-input" 
                      accept="image/*"
                      style={{ padding: '8px' }}
                    />
                    {uploading && <span style={{ fontSize: '0.8rem', color: 'var(--color-accent-dark)' }}>Uploading file...</span>}
                  </div>
                </div>
              </div>

              {/* Right Column Fields */}
              <div>
                <div className="form-group">
                  <label className="form-label">Regular Price (INR) *</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    placeholder="e.g. 500" 
                    min="1"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sale Price (Optional)</label>
                  <input 
                    type="number" 
                    name="sale_price" 
                    value={formData.sale_price} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    placeholder="e.g. 350" 
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input 
                    type="number" 
                    name="stock" 
                    value={formData.stock} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    placeholder="e.g. 20" 
                    min="0"
                    required 
                  />
                </div>

                {/* Image Preview box */}
                <div style={{
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 'var(--border-radius-sm)',
                  height: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f9f9f9',
                  overflow: 'hidden',
                  marginTop: '15px'
                }}>
                  {formData.image_url ? (
                    <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = '/logo.jpg'; }} />
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Image Preview</span>
                  )}
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '20px', marginTop: '20px' }}>
              <button type="button" onClick={handleCancelForm} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-accent">{isEditing ? 'Save Changes' : 'Create Product'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Catalog Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>Loading catalog...</div>
      ) : products.length === 0 ? (
        <div style={{ background: 'white', padding: '40px', borderRadius: 'var(--border-radius-md)', textAlign: 'center' }}>No products found.</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Title</th>
                <th>Category</th>
                <th>Base Price</th>
                <th>Sale Price</th>
                <th>Stock Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <img 
                      src={prod.image_url} 
                      alt={prod.title} 
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.05)' }} 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1609137144813-7d7274017b2b?q=80&w=600'; }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{prod.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prod.description}</div>
                  </td>
                  <td>{prod.category}</td>
                  <td>₹{prod.price}</td>
                  <td>{prod.sale_price !== null ? <b style={{ color: 'var(--color-success)' }}>₹{prod.sale_price}</b> : <span style={{ color: 'var(--color-text-muted)' }}>None</span>}</td>
                  <td>
                    {prod.stock <= 0 ? (
                      <span style={{ color: 'var(--color-danger)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={14} /> Out of Stock
                      </span>
                    ) : prod.stock <= 10 ? (
                      <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>Low Stock ({prod.stock})</span>
                    ) : (
                      <span style={{ color: 'var(--color-success)' }}>In Stock ({prod.stock})</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => handleOpenEditForm(prod)} 
                        className="nav-icon-btn" 
                        style={{ color: 'var(--color-accent-dark)' }}
                        title="Edit product"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(prod.id, prod.title)} 
                        className="nav-icon-btn" 
                        style={{ color: 'var(--color-danger)' }}
                        title="Delete product"
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
