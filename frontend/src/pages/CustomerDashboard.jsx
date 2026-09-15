import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import AppLayout from '../components/AppLayout';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import RecallTimeline from '../components/ui/RecallTimeline';
import { TableSkeleton } from '../components/ui/Skeleton';
import { User, ShoppingBag, AlertTriangle, RotateCcw, CheckCircle2, AlertCircle, RefreshCw, Store, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'recalls' | 'returns'

  const [orders, setOrders] = useState([]);
  const [recalls, setRecalls] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Return modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('Manufacturing quality defect return');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError('');
      const [ordRes, recallRes, returnRes] = await Promise.all([
        API.get('/orders/my-orders'),
        API.get('/recalls'),
        API.get('/returns')
      ]);

      if (ordRes.data.success) setOrders(ordRes.data.orders);
      if (recallRes.data.success) setRecalls(recallRes.data.recalls);
      if (returnRes.data.success) setReturnRequests(returnRes.data.returnRequests);
    } catch (err) {
      console.error('Fetch customer data error:', err);
      setError('Failed to load customer records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  // Customer submits return request to original purchase Shop
  const handleConfirmReturn = async () => {
    if (!selectedOrder) return;

    try {
      setSubmittingReturn(true);
      setError('');
      setSuccessMsg('');

      const res = await API.post('/returns/customer', {
        orderId: selectedOrder._id,
        reason: returnReason
      });

      if (res.data.success) {
        setSuccessMsg(`Return Request #${res.data.returnRequest.returnId} submitted to original purchase Shop '${selectedOrder.shopId?.name}'!`);
        setSelectedOrder(null);
        fetchCustomerData();
        setActiveTab('returns');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setSubmittingReturn(false);
    }
  };

  return (
    <AppLayout>
      <div className="animate-fade-in" style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Hero Banner */}
        <div className="card-surface" style={{
          padding: '2rem',
          marginBottom: '2rem',
          borderLeft: '4px solid var(--primary-blue)',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          border: '1px solid #DBEAFE'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <Badge variant="customer" icon={User}>CUSTOMER PORTAL</Badge>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1E3A8A', letterSpacing: '-0.02em' }}>
                My Orders & Recall Return Portal
              </h1>
              <p style={{ color: 'var(--text-sub)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                Welcome back, <strong>{user?.name}</strong>. Inspect purchase orders, track recall alerts, and request returns to your original purchase shop.
              </p>
            </div>

            <Link to="/customer/marketplace" className="btn btn-primary">
              <ShoppingBag size={16} />
              <span>Browse Marketplace</span>
            </Link>
          </div>
        </div>

        {/* Analytics Stat Cards */}
        <div className="dashboard-grid">
          <StatCard
            title="PURCHASED ORDERS"
            value={`${orders.length} Orders`}
            subtext="Acquired from retail shops"
            icon={ShoppingBag}
            color="info"
          />

          <StatCard
            title="RECALL NOTIFICATIONS"
            value={`${recalls.length} Alerts`}
            subtext="Affecting your batch orders"
            icon={AlertTriangle}
            color={recalls.length > 0 ? 'danger' : 'success'}
          />

          <StatCard
            title="RETURNS IN PROGRESS"
            value={`${returnRequests.length} Requests`}
            subtext="Tracked through shop & manufacturer"
            icon={RotateCcw}
            color="warning"
          />
        </div>

        {/* Banners */}
        {error && (
          <div className="error-banner animate-fade-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="success-banner animate-fade-in">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('orders')}
            className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-ghost'}`}
          >
            My Order History ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('recalls')}
            className={`btn btn-sm ${activeTab === 'recalls' ? 'btn-danger' : 'btn-ghost'}`}
          >
            Recall Alerts ({recalls.length})
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            className={`btn btn-sm ${activeTab === 'returns' ? 'btn-secondary' : 'btn-ghost'}`}
          >
            Return Progress ({returnRequests.length})
          </button>
        </div>

        {/* Tab 1: Orders History */}
        {activeTab === 'orders' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              Purchased Product Orders
            </h3>

            {orders.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="No Orders Placed Yet"
                description="Visit the Customer Marketplace to browse items and purchase from retail Shops!"
                actionButton={
                  <Link to="/customer/marketplace" className="btn btn-primary btn-sm">
                    Go to Marketplace
                  </Link>
                }
              />
            ) : (
              <div className="table-wrapper">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Product</th>
                      <th>Batch Number</th>
                      <th>Purchased From Shop</th>
                      <th>Quantity</th>
                      <th>Total Cost</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => {
                      const isRecalled = recalls.some((r) => r.batchNo === ord.batchNo);
                      return (
                        <tr key={ord._id}>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-blue)', fontWeight: 700 }}>
                            #{ord.orderId}
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ord.productName}</td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', color: '#0369A1', fontWeight: 700 }}>
                              {ord.batchNo}
                            </span>
                          </td>
                          <td>
                            <Badge variant="shop" icon={Store}>{ord.shopId?.name || 'Shop'}</Badge>
                          </td>
                          <td style={{ color: 'var(--success-color)', fontWeight: 700 }}>{ord.quantity} units</td>
                          <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>${ord.totalAmount}</td>
                          <td style={{ textAlign: 'right' }}>
                            {isRecalled ? (
                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="btn btn-danger btn-sm"
                              >
                                <RotateCcw size={13} /> Return Recalled Item
                              </button>
                            ) : (
                              <Badge variant="success">Standard Order</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Recalls Alerts */}
        {activeTab === 'recalls' && (
          <div className="card-surface" style={{ padding: '1.5rem', borderLeft: '4px solid var(--danger-color)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} color="var(--danger-color)" /> Product Recall Alerts for Purchased Batches
            </h3>

            {recalls.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No active recall alerts for your purchased product batches.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {recalls.map((r) => {
                  const affectedOrder = orders.find((o) => o.batchNo === r.batchNo);
                  return (
                    <div key={r._id} style={{
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <Badge variant="danger">⚠️ RECALL ALERT</Badge>
                        <span style={{ fontFamily: 'var(--font-mono)', color: '#991B1B', fontWeight: 700 }}>BATCH: {r.batchNo}</span>
                      </div>

                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                        {r.productName}
                      </h4>

                      <p style={{ color: 'var(--danger-color)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Reason: {r.reason}
                      </p>

                      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Instructions: </span>
                        <span style={{ color: 'var(--text-main)' }}>{r.message}</span>
                      </div>

                      {affectedOrder && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#EFF6FF', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #DBEAFE' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ORIGINAL PURCHASE RETAILER</div>
                            <div style={{ color: 'var(--text-main)', fontWeight: 700 }}>{affectedOrder.shopId?.name || 'Original Shop'}</div>
                          </div>

                          <button
                            onClick={() => setSelectedOrder(affectedOrder)}
                            className="btn btn-danger btn-sm"
                          >
                            Submit Return Request
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Return Tracking */}
        {activeTab === 'returns' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              Submitted Return Progress Pipeline
            </h3>

            {returnRequests.length === 0 ? (
              <EmptyState
                icon={RotateCcw}
                title="No Active Return Requests"
                description="Return requests submitted for recalled items will track through Shop and Manufacturer confirmation steps here."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {returnRequests.map((ret) => (
                  <div key={ret._id} className="card-surface" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div>
                        <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>{ret.productName}</strong>
                        <span style={{ fontFamily: 'var(--font-mono)', color: '#0369A1', marginLeft: '0.75rem', fontSize: '0.825rem' }}>
                          BATCH: {ret.batchNo}
                        </span>
                      </div>

                      <Badge variant={ret.status === 'RECEIVED_BY_MANAGER' ? 'success' : 'warning'}>
                        {ret.status}
                      </Badge>
                    </div>

                    {/* Step Timeline */}
                    <RecallTimeline currentStatus={ret.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Return Request Modal */}
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title="Request Recalled Product Return"
          maxWidth="480px"
        >
          {selectedOrder && (
            <div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                <div style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem' }}>
                  {selectedOrder.productName}
                </div>
                <div style={{ color: '#0369A1', fontFamily: 'var(--font-mono)', fontSize: '0.825rem', marginBottom: '0.4rem' }}>
                  Batch: {selectedOrder.batchNo} | Qty: {selectedOrder.quantity} units
                </div>
                <div style={{ color: 'var(--primary-blue)', fontWeight: 600, fontSize: '0.85rem' }}>
                  Destination Shop: {selectedOrder.shopId?.name || 'Original Shop'}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Reason for Return *</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSelectedOrder(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReturn}
                  disabled={submittingReturn}
                  className="btn btn-danger"
                >
                  {submittingReturn ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </AppLayout>
  );
};

export default CustomerDashboard;
