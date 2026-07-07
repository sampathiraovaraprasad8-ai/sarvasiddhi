import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function AdminRoute({ children }) {
  const { user, token, loading } = useApp();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        fontSize: '1.2rem',
        color: 'var(--color-text-muted)'
      }}>
        Verifying administrative credentials...
      </div>
    );
  }

  // If not logged in or not admin, redirect to login
  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
}
