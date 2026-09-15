import React, { useState, useEffect } from 'react';
import API from '../services/api';
import AppLayout from '../components/AppLayout';
import TraceabilityTree from '../components/ui/TraceabilityTree';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Search, Shield, Package, Store, Users, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const ManagerTraceability = () => {
  const [searchParams] = useSearchParams();
  const initialBatch = searchParams.get('batch') || '';

  const [batchNo, setBatchNo] = useState(initialBatch);
  const [traceability, setTraceability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!batchNo.trim()) {
      setError('Please enter a Batch Number to trace lineage');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setTraceability(null);

      const res = await API.get(`/traceability/${batchNo.trim().toUpperCase()}`);
      if (res.data.success) {
        setTraceability(res.data.traceability);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate batch traceability lineage graph');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialBatch) {
      handleSearch();
    }
  }, []);

  return (
    <AppLayout>
      <div className="animate-fade-in" style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Search Header Banner */}
        <div className="card-surface" style={{
          padding: '2.5rem 2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          border: '1px solid #DBEAFE',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.75rem',
            borderRadius: '16px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #DBEAFE',
            color: 'var(--primary-blue)',
            marginBottom: '1rem'
          }}>
            <Search size={32} />
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            End-to-End Batch Lineage Traceability
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto 1.75rem auto' }}>
            Inspect complete multi-tiered supply chain lineage from Manufacturer Origin down to Retail Shops, Customer Purchase Orders, and Active Recalls.
          </p>

          <form onSubmit={handleSearch} style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', gap: '0.65rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Batch No (e.g. POCO-B001)..."
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', textTransform: 'uppercase', padding: '0.8rem 1.1rem' }}
            />
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: 'auto' }}>
              {loading ? 'Tracing...' : 'Trace Lineage'}
            </button>
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="error-banner animate-fade-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Traceability Summary Metrics */}
        {traceability && (
          <div className="dashboard-grid">
            <StatCard
              title="MANUFACTURED BATCH STOCK"
              value={`${traceability.summary.totalManufactured} Units`}
              subtext={`Unit price: $${traceability.product.price}`}
              icon={Package}
              color="purple"
            />

            <StatCard
              title="DISTRIBUTED TO SHOPS"
              value={`${traceability.summary.totalDistributedToShops} Units`}
              subtext={`Across ${traceability.summary.uniqueShopsCount} unique shops`}
              icon={Store}
              color="success"
            />

            <StatCard
              title="CUSTOMER PURCHASE ORDERS"
              value={`${traceability.summary.totalPurchasedByCustomers} Units`}
              subtext={`${traceability.summary.uniqueCustomersCount} total customer orders`}
              icon={Users}
              color="info"
            />

            <StatCard
              title="RECALL STATUS"
              value={traceability.summary.activeRecallsCount > 0 ? 'ACTIVE RECALL' : 'NO RECALL'}
              subtext={`${traceability.summary.totalReturnsSubmitted} return requests logged`}
              icon={AlertTriangle}
              color={traceability.summary.activeRecallsCount > 0 ? 'danger' : 'success'}
            />
          </div>
        )}

        {/* Traceability Visual Lineage Tree */}
        {traceability ? (
          <TraceabilityTree data={traceability} />
        ) : !loading && (
          <EmptyState
            icon={Search}
            title="Search Batch Lineage"
            description="Enter a product Batch Number above to trace its end-to-end supply chain path."
          />
        )}
      </div>
    </AppLayout>
  );
};

export default ManagerTraceability;
