import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Shield, Bell, LogOut, User as UserIcon, Store, ShoppingBag, Search, Check, AlertTriangle, ChevronDown } from 'lucide-react';
import Badge from './ui/Badge';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleVariant = (role) => {
    switch (role) {
      case 'Manager': return 'manager';
      case 'Shop': return 'shop';
      default: return 'customer';
    }
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.startsWith('/manager/traceability')) return 'Batch Traceability & Lineage';
    if (path.startsWith('/manager')) return 'Manufacturer Operations Control';
    if (path.startsWith('/shop')) return 'Shop Operations & Distributor Hub';
    if (path.startsWith('/customer/marketplace')) return 'Customer Product Marketplace';
    if (path.startsWith('/customer')) return 'My Customer Orders & Recalls';
    return 'Enterprise Portal';
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left Section: Brand / Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              backgroundColor: '#2563eb',
              padding: '0.45rem',
              borderRadius: '10px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={20} />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.02em' }}>
              SupplyTrace Enterprise
            </span>
          </Link>

          {/* Breadcrumb separator */}
          {isAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>
              <span>/</span>
              <span style={{ color: '#475569', fontWeight: 600 }}>{getBreadcrumb()}</span>
            </div>
          )}
        </div>

        {/* Right Section: Navigation / Notifications / User Menu */}
        {isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
            
            {/* Quick Customer Links */}
            {user.role === 'Customer' && (
              <nav style={{ display: 'flex', gap: '0.5rem', marginRight: '0.5rem' }}>
                <Link
                  to="/customer/marketplace"
                  className={`btn btn-sm ${location.pathname === '/customer/marketplace' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  <ShoppingBag size={15} />
                  <span>Marketplace</span>
                </Link>
                <Link
                  to="/customer"
                  className={`btn btn-sm ${location.pathname === '/customer' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  <UserIcon size={15} />
                  <span>My Orders</span>
                </Link>
              </nav>
            )}

            {/* Notification Bell with Popover */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="btn-secondary btn-sm"
                style={{ padding: '0.55rem', borderRadius: '10px', position: 'relative', backgroundColor: '#f8fafc' }}
                title="Notifications"
              >
                <Bell size={18} color="#2563eb" />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifications && (
                <div className="card-surface animate-scale-in" style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: '360px',
                  maxHeight: '440px',
                  overflowY: 'auto',
                  padding: '1rem',
                  zIndex: 250,
                  boxShadow: 'var(--shadow-lg)',
                  backgroundColor: '#ffffff'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '0.5rem'
                  }}>
                    <strong style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>
                      Notifications ({unreadCount} unread)
                    </strong>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
                      No unread alerts or notifications.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {notifications.map((n) => (
                        <div
                          key={n._id}
                          style={{
                            backgroundColor: n.isRead ? '#f8fafc' : '#eff6ff',
                            border: `1px solid ${n.isRead ? 'var(--border-color)' : '#dbeafe'}`,
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.825rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <strong style={{ color: n.type === 'RECALL' ? '#dc2626' : '#1e3a8a' }}>
                              {n.title}
                            </strong>
                            {!n.isRead && (
                              <button
                                onClick={() => markAsRead(n._id)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                              >
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                          <p style={{ color: 'var(--text-sub)', fontSize: '0.78rem', lineHeight: '1.4' }}>
                            {n.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile Pill & Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="btn-secondary btn-sm"
                style={{ padding: '0.4rem 0.75rem', gap: '0.6rem', backgroundColor: '#f8fafc' }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}>
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>{user.name}</span>
                <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                <ChevronDown size={14} color="var(--text-sub)" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="card-surface animate-scale-in" style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: '220px',
                  padding: '0.75rem',
                  zIndex: 250,
                  boxShadow: 'var(--shadow-lg)',
                  backgroundColor: '#ffffff'
                }}>
                  <div style={{ padding: '0.5rem 0.5rem 0.75rem 0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#1e3a8a', fontSize: '0.875rem', display: 'block' }}>{user.name}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user.email}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', color: '#dc2626' }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-outline btn-sm">
              Log In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register Account
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
