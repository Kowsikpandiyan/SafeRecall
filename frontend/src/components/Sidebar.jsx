import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Store,
  Package,
  Layers,
  RotateCcw,
  AlertTriangle,
  Search,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Shield
} from 'lucide-react';
import Badge from './ui/Badge';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const role = user.role ? user.role.toLowerCase() : '';

  // Manager Navigation Items
  const managerNav = [
    { id: 'products', label: 'Products & Batches', icon: Package },
    { id: 'recalls', label: 'Product Recalls', icon: AlertTriangle },
    { id: 'returns', label: 'Returns Tracking', icon: RotateCcw },
    { id: 'shops', label: 'Supplied Shops', icon: Store }
  ];

  // Shop Navigation Items
  const shopNav = [
    { id: 'suppliers', label: 'Manager Suppliers', icon: Briefcase },
    { id: 'inventory', label: 'Shop Inventory', icon: Layers },
    { id: 'orders', label: 'Customer Orders', icon: ShoppingCart },
    { id: 'recalls', label: 'Recall Alerts & Returns', icon: AlertTriangle }
  ];

  const navItems = role === 'manager' || role === 'admin' ? managerNav : role === 'shop' ? shopNav : [];

  return (
    <aside style={{
      width: collapsed ? '72px' : '260px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid var(--border-color)',
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      zIndex: 90,
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{
        padding: collapsed ? '1.25rem 0.75rem' : '1.25rem 1.25rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        backgroundColor: '#ffffff'
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            backgroundColor: '#2563eb',
            padding: '0.5rem',
            borderRadius: '10px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Shield size={20} />
          </div>
          {!collapsed && (
            <div>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.2 }}>
                SupplyTrace
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                Enterprise Operations
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn-ghost"
          style={{ padding: '0.3rem', borderRadius: '6px' }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Role Profile Badge */}
      {!collapsed && (
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              border: '1px solid #dbeafe',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem'
            }}>
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <strong style={{ color: '#0f172a', fontSize: '0.875rem', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user.name}
              </strong>
              <Badge variant={role === 'manager' ? 'manager' : 'shop'} style={{ marginTop: '0.15rem' }}>
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          padding: collapsed ? '0 0.25rem 0.5rem' : '0 0.5rem 0.5rem',
          textAlign: collapsed ? 'center' : 'left'
        }}>
          {collapsed ? '•••' : 'Main Menu'}
        </div>

        {navItems.map((item) => {
          const ItemIcon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab && setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: collapsed ? '0.7rem' : '0.65rem 0.85rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                color: isActive ? '#2563eb' : '#64748b',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={collapsed ? item.label : undefined}
            >
              <ItemIcon size={18} color={isActive ? '#2563eb' : '#64748b'} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* Traceability Search Link for Manager */}
        {role === 'manager' && (
          <Link
            to="/manager/traceability"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: collapsed ? '0.7rem' : '0.65rem 0.85rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              backgroundColor: location.pathname === '/manager/traceability' ? '#eff6ff' : 'transparent',
              color: location.pathname === '/manager/traceability' ? '#2563eb' : '#64748b',
              fontWeight: location.pathname === '/manager/traceability' ? 800 : 600,
              fontSize: '0.875rem',
              marginTop: '0.5rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '0.75rem'
            }}
            title={collapsed ? 'Batch Traceability' : undefined}
          >
            <Search size={18} color={location.pathname === '/manager/traceability' ? '#2563eb' : '#64748b'} />
            {!collapsed && <span>Batch Traceability</span>}
          </Link>
        )}
      </nav>

      {/* Footer / Logout */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={logout}
          className="btn-ghost"
          style={{
            width: '100%',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: '#dc2626',
            padding: collapsed ? '0.7rem' : '0.65rem 0.85rem'
          }}
          title="Logout"
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
