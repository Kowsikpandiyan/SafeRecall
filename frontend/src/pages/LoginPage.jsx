import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import Badge from '../components/ui/Badge';
import { Lock, Mail, AlertCircle, Shield, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const { login, error: authError, setError, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setError(null);

    if (!email.trim()) {
      setFormError('Please enter your email address');
      return;
    }

    if (!password) {
      setFormError('Please enter your password');
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      const role = result.user.role;
      let targetPath = '/customer/marketplace';
      if (role === 'Manager') targetPath = '/manager';
      else if (role === 'Shop') targetPath = '/shop';

      navigate(from || targetPath, { replace: true });
    }
  };

  return (
    <AppLayout>
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}>
        <div className="card-surface animate-scale-in" style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem 2rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex',
              padding: '0.75rem',
              borderRadius: '16px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              color: 'var(--primary-blue)',
              marginBottom: '1rem'
            }}>
              <Shield size={32} />
            </div>

            <Badge variant="info" style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>ENTERPRISE PORTAL</Badge>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
              Portal Sign In
            </h2>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>
              Access Manufacturer, Shop, or Customer workspace
            </p>
          </div>

          {(formError || authError) && (
            <div className="error-banner animate-fade-in">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{formError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-sub)' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--primary-blue)', fontWeight: 700, textDecoration: 'none' }}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default LoginPage;
