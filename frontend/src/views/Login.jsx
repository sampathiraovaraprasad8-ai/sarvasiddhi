import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserPlus, LogIn, Lock, Mail, User } from 'lucide-react';

export default function Login() {
  const { login, token, user, API_URL } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode toggling: 'login' or 'register'
  const [mode, setMode] = useState('login');

  // Input states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (token && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [token, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    setError('');
    setSuccess('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '', adminCode: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { name, email, password, confirmPassword } = formData;

    if (!email || !password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (mode === 'register') {
      if (!name) {
        setError('Name is required to register');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const bodyPayload = mode === 'login' 
        ? { email, password } 
        : { name, email, password, adminCode: formData.adminCode };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      const data = await res.json();

      if (res.ok) {
        if (mode === 'register') {
          setSuccess('Account created successfully! Logging you in...');
          setTimeout(() => {
            login(data.token, data.user);
          }, 1500);
        } else {
          login(data.token, data.user);
        }
      } else {
        setError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Connection refused. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: 'white',
        padding: '40px',
        borderRadius: 'var(--border-radius-md)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid rgba(226, 168, 43, 0.2)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            {mode === 'login' 
              ? 'Access your saved wishlists and past orders' 
              : 'Join Sarvasiddhi for personalized spiritual shopping'}
          </p>
        </div>

        {/* Notices */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(185, 28, 28, 0.08)',
            border: '1px solid var(--color-danger)',
            color: 'var(--color-danger)',
            padding: '12px 15px',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            backgroundColor: 'rgba(21, 128, 61, 0.08)',
            border: '1px solid var(--color-success)',
            color: 'var(--color-success)',
            padding: '12px 15px',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            fontWeight: 500
          }}>
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  placeholder="Shiva Kumar" 
                  style={{ paddingLeft: '45px' }}
                  required 
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                className="form-input" 
                placeholder="email@example.com" 
                style={{ paddingLeft: '45px' }}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleInputChange} 
                className="form-input" 
                placeholder="••••••••" 
                style={{ paddingLeft: '45px' }}
                required 
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    placeholder="••••••••" 
                    style={{ paddingLeft: '45px' }}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Admin Secret Code (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input 
                    type="text" 
                    name="adminCode" 
                    value={formData.adminCode} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    placeholder="Enter secret code to register as Admin" 
                    style={{ paddingLeft: '45px' }}
                  />
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '10px', display: 'flex', gap: '8px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (
              mode === 'login' ? (
                <>
                  <LogIn size={18} /> Log In
                </>
              ) : (
                <>
                  <UserPlus size={18} /> Register Account
                </>
              )
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={handleToggleMode} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                Register here
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={handleToggleMode} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                Log in here
              </button>
            </>
          )}
        </div>

        <div style={{
          marginTop: '30px',
          padding: '12px',
          backgroundColor: 'rgba(92,6,18,0.03)',
          border: '1px dashed rgba(92,6,18,0.1)',
          borderRadius: '6px',
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)',
          lineHeight: '1.4'
        }}>
          💡 <b>Want to log in with your own Admin Email?</b><br />
          Click <b>Register here</b> above and enter the secret admin code:<br />
          <code style={{ userSelect: 'all', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>SARVASIDDHI_ADMIN_2026</code>
        </div>
      </div>
    </div>
  );
}
