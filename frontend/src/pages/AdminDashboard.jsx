import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Shield, Users, Server, KeyRound, CheckCircle2, Lock, Package, ShoppingCart, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/products');
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Fetch products admin error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalStockAdded = products.reduce((sum, p) => sum + (p.initialStock || p.stockQuantity), 0);
  const currentAvailableStock = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const totalSoldToShops = totalStockAdded - currentAvailableStock;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1150px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{
        padding: '2rem',
        marginBottom: '2rem',
        borderLeft: '5px solid var(--admin-color)',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(18, 24, 38, 0.8) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-admin">
                <Shield size={14} /> ADMIN EXECUTIVE PORTAL
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Route: /admin
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>
              System Overview & Operations Control
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Welcome back, <strong>{user?.name}</strong> ({user?.email}). Global controller oversight across all Manager inventory & Shop purchases.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Package size={20} color="var(--admin-color)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL PRODUCTS CREATED</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>{products.length} SKUs</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Server size={20} color="#10b981" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>INVENTORY REMAINING</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>{currentAvailableStock} Units</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <ShoppingCart size={20} color="#3b82f6" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SHOP ACQUISITIONS</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6' }}>{totalSoldToShops} Units</div>
        </div>
      </div>

      {/* Inventory System Status Table */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} color="var(--admin-color)" /> System Inventory Monitoring
          </h3>
          <button onClick={fetchProducts} className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
            <div className="spinner" style={{ margin: '0 auto 0.5rem auto' }}></div>
            <p>Loading system stats...</p>
          </div>
        ) : products.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            No products currently registered in MongoDB. Log in as Manager to add inventory items.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Product Name</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>SKU</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Price</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Manager Initial Stock</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Current Inventory</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Shop Purchased</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const initStock = p.initialStock || p.stockQuantity;
                  const sold = initStock - p.stockQuantity;
                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.75rem', color: 'white', fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#a7f3d0' }}>{p.sku}</td>
                      <td style={{ padding: '0.75rem', color: 'white' }}>${p.price}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{initStock} Units</td>
                      <td style={{ padding: '0.75rem', color: '#10b981', fontWeight: 700 }}>{p.stockQuantity} Remaining</td>
                      <td style={{ padding: '0.75rem', color: '#60a5fa', fontWeight: 700 }}>{sold} Bought</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Permission Matrix */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={20} color="var(--admin-color)" /> Access & Authorization Matrix
        </h3>
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Target Route</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Allowed Role</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Your Current Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#a7f3d0' }}>/admin</td>
                <td style={{ padding: '0.75rem' }}><span className="badge badge-admin">admin</span></td>
                <td style={{ padding: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={16} /> Granted Access
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#fef08a' }}>/manager</td>
                <td style={{ padding: '0.75rem' }}><span className="badge badge-manager">manager</span></td>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Restricted to Manager</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#bfdbfe' }}>/user</td>
                <td style={{ padding: '0.75rem' }}><span className="badge badge-user">user</span></td>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Restricted to User</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
