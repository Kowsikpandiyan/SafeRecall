import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import AppLayout from '../components/AppLayout';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import RecallTimeline from '../components/ui/RecallTimeline';
import OrderTracker from '../components/ui/OrderTracker';
import ReviewModal from '../components/ui/ReviewModal';
import {
  User,
  ShoppingBag,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Store,
  Clock,
  Star,
  MessageSquare,
  ShieldAlert,
  FileText,
  ShieldCheck,
  ShieldAlert as ShieldWarnIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'recalls' | 'returns' | 'complaints' | 'reviews'

  const [orders, setOrders] = useState([]);
  const [recalls, setRecalls] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Return modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('Manufacturing quality defect return');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState(null);

  // Complaint modal state
  const [selectedComplaintOrder, setSelectedComplaintOrder] = useState(null);
  const [complaintType, setComplaintType] = useState('Manufacturing Defect');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError('');
      const [ordRes, recallRes, returnRes, revRes, compRes] = await Promise.all([
        API.get('/orders/my-orders'),
        API.get('/recalls'),
        API.get('/returns'),
        API.get('/reviews/my-reviews'),
        API.get('/complaints/my-complaints')
      ]);

      if (ordRes.data.success) setOrders(ordRes.data.orders);
      if (recallRes.data.success) setRecalls(recallRes.data.recalls);
      if (returnRes.data.success) setReturnRequests(returnRes.data.returnRequests);
      if (revRes.data.success) setMyReviews(revRes.data.reviews);
      if (compRes.data.success) setMyComplaints(compRes.data.complaints);
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

  // Helper for warranty calculations
  const getWarrantyDetails = (order) => {
    const purchaseDate = new Date(order.orderDate || order.createdAt);
    const months = order.productId?.warrantyMonths || 12; // default 1 Year
    const expiryDate = new Date(purchaseDate);
    expiryDate.setMonth(expiryDate.getMonth() + months);

    const now = new Date();
    const isActive = now <= expiryDate;

    return {
      purchaseDate,
      expiryDate,
      isActive,
      periodLabel: months % 12 === 0 ? `${months / 12} Year` : `${months} Months`
    };
  };

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

  // Customer submits complaint under active warranty
  const handleConfirmComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaintOrder) return;

    try {
      setSubmittingComplaint(true);
      setError('');
      setSuccessMsg('');

      const res = await API.post('/complaints', {
        orderId: selectedComplaintOrder._id,
        complaintType,
        description: complaintDesc
      });

      if (res.data.success) {
        setSuccessMsg(`Complaint #${res.data.complaint.complaintId} submitted successfully under Active Warranty!`);
        setSelectedComplaintOrder(null);
        setComplaintType('Manufacturing Defect');
        setComplaintDesc('');
        fetchCustomerData();
        setActiveTab('complaints');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const isReviewed = (orderId) => {
    return myReviews.some((r) => r.orderId?._id === orderId || r.orderId === orderId);
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
                Welcome Back, {user?.name}!
              </h1>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem' }}>
                Track live orders, inspect warranty validation, report product issues, and follow recall returns.
              </p>
            </div>
            <Link to="/customer/marketplace" className="btn btn-primary btn-lg">
              <ShoppingBag size={18} />
              <span>Browse Marketplace</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="PURCHASED ORDERS"
            value={orders.length}
            subtext="Items ordered across shops"
            icon={ShoppingBag}
            color="info"
          />
          <StatCard
            title="WARRANTY COMPLAINTS"
            value={myComplaints.length}
            subtext="Reported product issues"
            icon={ShieldAlert}
            color="warning"
          />
          <StatCard
            title="RECALL ALERTS"
            value={recalls.length}
            subtext="Notifications for purchased batches"
            icon={AlertTriangle}
            color={recalls.length > 0 ? 'danger' : 'success'}
          />
          <StatCard
            title="ACTIVE RETURNS"
            value={returnRequests.filter((r) => r.status !== 'RECEIVED_BY_MANAGER').length}
            subtext="Returns in progress pipeline"
            icon={RotateCcw}
            color="purple"
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
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('orders')}
            className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-ghost'}`}
          >
            My Orders & Tracking ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`btn btn-sm ${activeTab === 'complaints' ? 'btn-warning' : 'btn-ghost'}`}
            style={activeTab === 'complaints' ? { backgroundColor: '#F59E0B', color: '#FFF' } : {}}
          >
            <ShieldAlert size={14} /> My Complaints ({myComplaints.length})
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

          <button
            onClick={() => setActiveTab('reviews')}
            className={`btn btn-sm ${activeTab === 'reviews' ? 'btn-outline' : 'btn-ghost'}`}
          >
            My Reviews ({myReviews.length})
          </button>
        </div>

        {/* Tab 1: Orders & Tracking with Warranty Validation */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.length === 0 ? (
              <div className="card-surface" style={{ padding: '2rem' }}>
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
              </div>
            ) : (
              orders.map((ord) => {
                const isRecalled = recalls.some((r) => r.batchNo === ord.batchNo);
                const isDelivered = ord.status === 'DELIVERED' || ord.status === 'COMPLETED';
                const hasReviewed = isReviewed(ord._id);

                const { purchaseDate, expiryDate, isActive, periodLabel } = getWarrantyDetails(ord);

                return (
                  <div key={ord._id} className="card-surface" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order Reference: </span>
                        <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-blue)', fontSize: '1.05rem' }}>#{ord.orderId}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '1rem' }}>
                          Placed on: {purchaseDate.toLocaleDateString()}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Badge variant="shop" icon={Store}>{ord.shopId?.name || 'Shop'}</Badge>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          backgroundColor: isDelivered ? '#ECFDF5' : '#EFF6FF',
                          color: isDelivered ? '#047857' : '#1D4ED8',
                          border: `1px solid ${isDelivered ? '#A7F3D0' : '#BFDBFE'}`
                        }}>
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Details Body */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PRODUCT</div>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.05rem' }}>{ord.productName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#0369A1', fontFamily: 'var(--font-mono)' }}>Batch: {ord.batchNo}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>QUANTITY & PRICE</div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ord.quantity} units @ ${ord.price}/unit</div>
                        <div style={{ fontWeight: 800, color: 'var(--success-color)', fontSize: '1.1rem' }}>Total: ${ord.totalAmount}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RETAILER INFO</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ord.shopId?.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>{ord.shopId?.email}</div>
                      </div>
                    </div>

                    {/* Warranty Validation Section */}
                    <div style={{
                      backgroundColor: isActive ? '#F0FDF4' : '#FFFBEB',
                      border: `1px solid ${isActive ? '#BBF7D0' : '#FDE68A'}`,
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {isActive ? (
                          <div style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '0.4rem', borderRadius: '50%' }}>
                            <ShieldCheck size={20} />
                          </div>
                        ) : (
                          <div style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.4rem', borderRadius: '50%' }}>
                            <ShieldWarnIcon size={20} />
                          </div>
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ fontSize: '0.9rem', color: isActive ? '#15803D' : '#B45309' }}>
                              {isActive ? '✅ Warranty Active' : '⚠️ Warranty Expired'}
                            </strong>
                            <span style={{ fontSize: '0.75rem', backgroundColor: '#FFFFFF', padding: '0.1rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-sub)' }}>
                              Warranty: {periodLabel}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '0.15rem' }}>
                            Purchase Date: <strong>{purchaseDate.toLocaleDateString()}</strong> &nbsp;|&nbsp;
                            Warranty Until: <strong>{expiryDate.toLocaleDateString()}</strong>
                          </div>
                          {!isActive && (
                            <div style={{ fontSize: '0.78rem', color: '#B45309', fontWeight: 500, marginTop: '0.1rem' }}>
                              Warranty ended on {expiryDate.toLocaleDateString()}. Normal complaints disabled after expiry.
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        {isActive ? (
                          <button
                            onClick={() => setSelectedComplaintOrder(ord)}
                            className="btn btn-warning btn-sm"
                            style={{ backgroundColor: '#D97706', color: '#FFFFFF', border: 'none' }}
                          >
                            <ShieldAlert size={14} /> Report an Issue / Raise Complaint
                          </button>
                        ) : (
                          <button disabled className="btn btn-sm" style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#E2E8F0', color: '#64748B', border: 'none' }}>
                            Warranty Expired
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order Tracking Progress Line */}
                    <OrderTracker status={ord.status} orderDate={ord.orderDate} />

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                      {isRecalled && (
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="btn btn-danger btn-sm"
                        >
                          <RotateCcw size={14} /> Return Recalled Item
                        </button>
                      )}

                      {isDelivered && !hasReviewed && (
                        <button
                          onClick={() => setReviewOrder(ord)}
                          className="btn btn-warning btn-sm"
                          style={{ backgroundColor: '#F59E0B', color: '#FFFFFF', border: 'none' }}
                        >
                          <Star size={14} fill="#FFFFFF" /> Rate & Review Product
                        </button>
                      )}

                      {isDelivered && hasReviewed && (
                        <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', backgroundColor: '#ECFDF5', padding: '0.3rem 0.75rem', borderRadius: '6px' }}>
                          <CheckCircle2 size={14} /> Review Submitted
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Customer Complaints & Warranty Claims */}
        {activeTab === 'complaints' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="#D97706" /> Customer Complaints & Warranty Log
            </h3>

            {myComplaints.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No Complaints Submitted"
                description="If your purchased product has a manufacturing defect or is not working within its active warranty period, you can submit a complaint under My Orders."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {myComplaints.map((cmp) => (
                  <div key={cmp._id} style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    borderLeft: '4px solid #D97706'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#D97706', fontSize: '1rem' }}>
                          #{cmp.complaintId}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
                          Order: <strong>#{cmp.orderRefId}</strong>
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', backgroundColor: '#F0FDF4', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700, border: '1px solid #BBF7D0' }}>
                          ✅ {cmp.warrantyStatus} Warranty
                        </span>
                        <Badge variant="warning">{cmp.status}</Badge>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Product: </span>
                        <strong>{cmp.productName}</strong>
                      </div>

                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Batch Number: </span>
                        <strong style={{ fontFamily: 'var(--font-mono)', color: '#0369A1' }}>{cmp.batchNo}</strong>
                      </div>

                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Complaint Type: </span>
                        <strong style={{ color: '#B45309' }}>{cmp.complaintType}</strong>
                      </div>

                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Purchase Date: </span>
                        <span>{new Date(cmp.purchaseDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {cmp.description && (
                      <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-sub)', border: '1px solid var(--border-color)' }}>
                        <strong>Details:</strong> {cmp.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Recalls Alerts */}
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
                            <RotateCcw size={14} /> Initiate Return Request
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

        {/* Tab 4: Return Progress */}
        {activeTab === 'returns' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              Multi-Tier Return Pipeline Progress
            </h3>

            {returnRequests.length === 0 ? (
              <EmptyState
                icon={RotateCcw}
                title="No Return Requests Logged"
                description="When a manufacturer recalls a product batch, your eligible order return tickets will appear here."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {returnRequests.map((ret) => (
                  <div key={ret._id} style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-blue)', fontSize: '1rem' }}>
                          #{ret.returnId}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
                          Item: <strong>{ret.productName}</strong> (Batch: {ret.batchNo})
                        </span>
                      </div>

                      <Badge variant="purple">{ret.status}</Badge>
                    </div>

                    <RecallTimeline status={ret.status} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '0.75rem', backgroundColor: '#F8FAFC', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                      <span>Linked Original Shop: <strong>{ret.shopId?.name}</strong></span>
                      <span>Return Reason: {ret.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: My Submitted Reviews */}
        {activeTab === 'reviews' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={20} fill="#F59E0B" color="#F59E0B" /> My Submitted Reviews & Ratings
            </h3>

            {myReviews.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No Product Reviews Yet"
                description="Once your orders are delivered, you can rate and review your purchased items here!"
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {myReviews.map((rev) => (
                  <div key={rev._id} style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.05rem' }}>
                        {rev.productId?.name || 'Product'}
                      </span>
                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={16}
                            fill={s <= rev.rating ? '#F59E0B' : 'none'}
                            color={s <= rev.rating ? '#F59E0B' : '#CBD5E1'}
                          />
                        ))}
                      </div>
                    </div>

                    <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '0.85rem', fontStyle: 'italic' }}>
                      "{rev.reviewText}"
                    </p>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Shop: {rev.shopId?.name || 'Retailer'}</span>
                      <span>Batch: {rev.batchNo}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Customer Complaint Management */}
        <Modal
          isOpen={!!selectedComplaintOrder}
          onClose={() => setSelectedComplaintOrder(null)}
          title="Report an Issue / Raise Complaint"
        >
          {selectedComplaintOrder && (
            <form onSubmit={handleConfirmComplaint}>
              <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', padding: '0.85rem', borderRadius: '8px', color: '#92400E', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <strong>✅ Active Warranty Validated:</strong> Product is within its warranty period. Order information is automatically identified below.
              </div>

              {/* Readonly Order Details */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                fontSize: '0.85rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>CUSTOMER</span>
                  <strong>{user?.name}</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>ORDER REFERENCE</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-blue)' }}>#{selectedComplaintOrder.orderId}</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>PRODUCT</span>
                  <strong>{selectedComplaintOrder.productName}</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>BATCH NUMBER</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#0369A1' }}>{selectedComplaintOrder.batchNo}</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>RETAIL SHOP</span>
                  <strong>{selectedComplaintOrder.shopId?.name || 'Shop'}</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>PURCHASE DATE</span>
                  <span>{new Date(selectedComplaintOrder.orderDate || selectedComplaintOrder.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Form Inputs */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Complaint Type *</label>
                <select
                  className="form-input"
                  value={complaintType}
                  onChange={(e) => setComplaintType(e.target.value)}
                  required
                >
                  <option value="Manufacturing Defect">Manufacturing Defect</option>
                  <option value="Damaged Product">Damaged Product</option>
                  <option value="Product Not Working">Product Not Working</option>
                  <option value="Safety Issue">Safety Issue</option>
                  <option value="Expired Product">Expired Product</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Issue Details / Description (Optional)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Describe the issue experienced with this product..."
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setSelectedComplaintOrder(null)} className="btn btn-ghost btn-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingComplaint}
                  className="btn btn-warning btn-sm"
                  style={{ backgroundColor: '#D97706', color: '#FFFFFF', border: 'none' }}
                >
                  {submittingComplaint ? 'Submitting...' : 'Submit Warranty Complaint'}
                </button>
              </div>
            </form>
          )}
        </Modal>

        {/* Modal: Customer Return Request Confirmation */}
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title="Request Recalled Item Return"
        >
          {selectedOrder && (
            <div>
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '0.85rem', borderRadius: '8px', color: '#991B1B', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <strong>⚠️ Supply Chain Lineage Notice:</strong> This return request is strictly routed to your original purchase shop <strong>'{selectedOrder.shopId?.name}'</strong>.
              </div>

              <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                <div><strong>Product:</strong> {selectedOrder.productName}</div>
                <div><strong>Batch Number:</strong> {selectedOrder.batchNo}</div>
                <div><strong>Quantity to Return:</strong> {selectedOrder.quantity} units</div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Return Reason</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button onClick={() => setSelectedOrder(null)} className="btn btn-ghost btn-sm">
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReturn}
                  disabled={submittingReturn}
                  className="btn btn-danger btn-sm"
                >
                  {submittingReturn ? 'Submitting...' : 'Confirm & Submit Return Request'}
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal: Review Modal */}
        <ReviewModal
          isOpen={!!reviewOrder}
          onClose={() => setReviewOrder(null)}
          order={reviewOrder}
          onReviewSubmitted={() => fetchCustomerData()}
        />

      </div>
    </AppLayout>
  );
};

export default CustomerDashboard;
