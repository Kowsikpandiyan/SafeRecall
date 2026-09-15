import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Home } from 'lucide-react';

const UnauthorizedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReturn = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const r = user.role ? user.role.toLowerCase() : '';
    if (r === 'manager' || r === 'admin') navigate('/manager');
    else if (r === 'shop') navigate('/shop');
    else navigate('/customer/marketplace');
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 100px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div className="glass-card animate-fade-in" style={{
        maxWidth: '500px',
        width: '100%',
        padding: '3rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          borderRadius: '50%',
          background: 'var(--error-bg)',
          border: '1px solid var(--error-border)',
          color: 'var(--error-red)',
          marginBottom: '1.5rem'
        }}>
          <ShieldAlert size={48} />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
          403 - Unauthorized Access
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          You do not have authorization to view this area. Route access is strictly partitioned by user role (Manager, Shop, Customer).
        </p>

        {user && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '2rem',
            fontSize: '0.875rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Logged in as: </span>
            <strong style={{ color: 'white' }}>{user.name}</strong>
            <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>|</span>
            <span style={{ color: 'var(--text-muted)' }}>Role: </span>
            <span className={`badge badge-${user.role.toLowerCase()}`} style={{ display: 'inline-flex' }}>{user.role}</span>
          </div>
        )}

        <button onClick={handleReturn} className="btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '0.8rem 1.75rem', margin: '0 auto' }}>
          <Home size={18} />
          <span>Return to Authorized Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
