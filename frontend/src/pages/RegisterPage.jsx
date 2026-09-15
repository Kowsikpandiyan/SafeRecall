import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import Badge from '../components/ui/Badge';
import { Shield, User, Mail, Lock, Phone, MapPin, ArrowRight, AlertCircle, Briefcase, Store } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Customer'); // 'Manager' | 'Shop' | 'Customer'
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState('');

  const { register, error: authError, setError, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setFormError('Please complete all required fields (Name, Email, Password)');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    const result = await register(name, email, password, role, phone, address);

    if (result.success) {
      const uRole = result.user.role;
      if (uRole === 'Manager') navigate('/manager', { replace: true });
      else if (uRole === 'Shop') navigate('/shop', { replace: true });
      else navigate('/customer/marketplace', { replace: true });
    }
  };

  return (
    <AppLayout>
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem'
      }}>
        <div className="card-surface animate-scale-in" style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2.5rem 2rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              display: 'inline-flex',
              padding: '0.75rem',
              borderRadius: '16px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              color: 'var(--primary-blue)',
              marginBottom: '0.75rem'
            }}>
              <Shield size={32} />
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
              Create Account
            </h2>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>
              Select your enterprise role to access the supply chain portal
            </p>
          </div>

          {(formError || authError) && (
            <div className="error-banner animate-fade-in">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{formError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Role Selector Tabs */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Select Account Role *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${role === 'Manager' ? 'btn-primary' : 'btn-outline'}`}
                  style={{
                    justifyContent: 'center'
                  }}
                  onClick={() => setRole('Manager')}
                >
                  <Briefcase size={14} /> Manager
                </button>

                <button
                  type="button"
                  className={`btn btn-sm ${role === 'Shop' ? 'btn-success' : 'btn-outline'}`}
                  style={{ justifyContent: 'center' }}
                  onClick={() => setRole('Shop')}
                >
                  <Store size={14} /> Shop
                </button>

                <button
                  type="button"
                  className={`btn btn-sm ${role === 'Customer' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ justifyContent: 'center' }}
                  onClick={() => setRole('Customer')}
                >
                  <User size={14} /> Customer
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name / Business Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder={role === 'Manager' ? 'e.g. Apex Manufacturing Ltd' : role === 'Shop' ? 'e.g. Metro Retail Store' : 'e.g. Alex Morgan'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address *</label>
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

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password *</label>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="phone"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">Location / Address</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="address"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                    placeholder="City, State"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? 'Creating Account...' : `Register as ${role}`}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-sub)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--primary-blue)', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default RegisterPage;
