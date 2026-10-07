import React, { useState, useEffect } from 'react';
import API from '../services/api';
import AppLayout from '../components/AppLayout';
import TraceabilityTree from '../components/ui/TraceabilityTree';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import BatchQRCodeModal from '../components/ui/BatchQRCodeModal';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Search, Shield, Package, Store, Users, AlertTriangle, AlertCircle, RefreshCw, QrCode, Star, MessageSquare } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const ManagerTraceability = () => {
  const [searchParams] = useSearchParams();
  const initialBatch = searchParams.get('batch') || '';

  const [batchNo, setBatchNo] = useState(initialBatch);
  const [traceability, setTraceability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

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

        {/* Active Recall Alert Banner (If batch is recalled) */}
        {traceability && traceability.recalls && traceability.recalls.length > 0 && (
          <div className="animate-fade-in" style={{
            backgroundColor: '#FEF2F2',
            border: '2px solid #EF4444',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Badge variant="danger" icon={AlertTriangle}>⚠️ URGENT: BATCH RECALL ACTIVE</Badge>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#991B1B' }}>BATCH: {traceability.batchNo}</span>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#991B1B', marginBottom: '0.3rem' }}>
              Defect Reason: {traceability.recalls[0].reason}
            </h3>
            <p style={{ color: '#7F1D1D', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              {traceability.recalls[0].message}
            </p>

            <div style={{ fontSize: '0.8rem', color: '#991B1B', backgroundColor: '#FFFFFF', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
              Recall status: <strong>{traceability.recalls[0].status}</strong> | Broadcast Date: {new Date(traceability.recalls[0].createdAt).toLocaleString()}
            </div>
          </div>
        )}

        {/* Traceability Summary Metrics */}
        {traceability && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Product: {traceability.product.name}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#0369A1', backgroundColor: '#E0F2FE', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
                  {traceability.batchNo}
                </span>
                {/* Rating Badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#FEF3C7', color: '#D97706', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                  <Star size={14} fill="#D97706" color="#D97706" />
                  <span>{traceability.product.averageRating > 0 ? `${traceability.product.averageRating} / 5` : 'No reviews'}</span>
                  {traceability.product.numReviews > 0 && <span style={{ color: '#92400E' }}>({traceability.product.numReviews} reviews)</span>}
                </div>
              </div>

              <button
                onClick={() => setShowQrModal(true)}
                className="btn btn-primary btn-sm"
              >
                <QrCode size={15} />
                <span>View & Download Batch QR Code</span>
              </button>
            </div>

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
          </>
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

        {/* Batch QR Code Modal */}
        {traceability && (
          <BatchQRCodeModal
            isOpen={showQrModal}
            onClose={() => setShowQrModal(false)}
            batchNo={traceability.batchNo}
            productName={traceability.product.name}
            managerName={traceability.manager.name}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default ManagerTraceability;
