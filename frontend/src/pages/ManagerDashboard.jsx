import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import AppLayout from '../components/AppLayout';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import BatchQRCodeModal from '../components/ui/BatchQRCodeModal';
import { TableSkeleton } from '../components/ui/Skeleton';
import {
  Briefcase,
  Plus,
  Package,
  Search,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Store,
  Layers,
  Check,
  X,
  Filter,
  QrCode,
  Star,
  MessageSquare,
  Zap,
  ShieldAlert,
  Users,
  Activity,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'smart-recall' | 'recalls' | 'returns' | 'complaints' | 'shops' | 'reviews'

  const [products, setProducts] = useState([]);
  const [recalls, setRecalls] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [shopPurchasers, setShopPurchasers] = useState([]);
  const [managerReviews, setManagerReviews] = useState([]);
  const [smartRecallData, setSmartRecallData] = useState([]);
  const [managerComplaints, setManagerComplaints] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showCreateRecallModal, setShowCreateRecallModal] = useState(false);
  const [selectedQrProduct, setSelectedQrProduct] = useState(null);
  const [confirmReceiptId, setConfirmReceiptId] = useState(null);
  const [confirmingReceipt, setConfirmingReceipt] = useState(false);

  // Add Product Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [totalQuantity, setTotalQuantity] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Create Recall Form
  const [recallBatchNo, setRecallBatchNo] = useState('');
  const [recallReason, setRecallReason] = useState('');
  const [recallMessage, setRecallMessage] = useState('');
  const [submittingRecall, setSubmittingRecall] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [prodRes, recallRes, returnRes, shopRes, revRes, smartRes, compRes] = await Promise.all([
        API.get('/products/my-products'),
        API.get('/recalls'),
        API.get('/returns'),
        API.get('/shop/manager-purchasers'),
        API.get('/reviews/manager'),
        API.get('/complaints/smart-recall-analysis'),
        API.get('/complaints/manager')
      ]);

      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (recallRes.data.success) setRecalls(recallRes.data.recalls);
      if (returnRes.data.success) setReturnRequests(returnRes.data.returnRequests);
      if (shopRes.data.success) setShopPurchasers(shopRes.data.purchases);
      if (revRes.data.success) setManagerReviews(revRes.data.reviews);
      if (smartRes.data.success) setSmartRecallData(smartRes.data.analysis);
      if (compRes.data.success) setManagerComplaints(compRes.data.complaints);
    } catch (err) {
      console.error('Fetch manager data error:', err);
      setError('Failed to load manufacturer operations records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Manager Adds Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name || !price || !batchNo || !totalQuantity) {
      setError('Please fill in Product Name, Price, Batch Number, and Total Quantity');
      return;
    }

    try {
      setSubmittingProduct(true);

      const res = await API.post('/products', {
        name,
        description,
        image: image || undefined,
        price: Number(price),
        batchNo,
        totalQuantity: Number(totalQuantity)
      });

      if (res.data.success) {
        setSuccessMsg(`Product Batch '${res.data.product.batchNo}' registered successfully! QR Code generated.`);
        setShowAddProductModal(false);
        setName('');
        setDescription('');
        setImage('');
        setPrice('');
        setBatchNo('');
        setTotalQuantity('');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product batch');
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Manager Creates Product Recall
  const handleCreateRecall = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!recallBatchNo || !recallReason || !recallMessage) {
      setError('Please provide Batch Number, Recall Reason, and Instructions');
      return;
    }

    try {
      setSubmittingRecall(true);

      const res = await API.post('/recalls', {
        batchNo: recallBatchNo,
        reason: recallReason,
        message: recallMessage
      });

      if (res.data.success) {
        setSuccessMsg(`⚠️ Product Recall #${res.data.recall.recallId} broadcasted to ${res.data.affectedShopsCount} shops and ${res.data.affectedCustomersCount} customers!`);
        setShowCreateRecallModal(false);
        setRecallBatchNo('');
        setRecallReason('');
        setRecallMessage('');
        fetchData();
        setActiveTab('recalls');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create recall');
    } finally {
      setSubmittingRecall(false);
    }
  };

  // Trigger existing recall modal pre-filled from Smart Recall Detection Alert
  const handleInitiateRecallFromAnalysis = (item) => {
    setRecallBatchNo(item.batchNo);
    setRecallReason(`Smart Recall Alert - ${item.mainIssue}`);
    setRecallMessage(`Recall initiated following Smart Batch Risk Detection. Repeated issue reported: ${item.mainIssue}. Total customer complaints: ${item.totalComplaints}. Please halt sales and return stock.`);
    setShowCreateRecallModal(true);
  };

  // Manager confirms receipt of returned recalled stock
  const handleConfirmReceipt = async () => {
    if (!confirmReceiptId) return;

    try {
      setConfirmingReceipt(true);
      setError('');
      setSuccessMsg('');

      const res = await API.patch(`/returns/manager/${confirmReceiptId}`);

      if (res.data.success) {
        setSuccessMsg('Returned recalled stock received and confirmed! Recall return pipeline closed.');
        setConfirmReceiptId(null);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm return receipt');
    } finally {
      setConfirmingReceipt(false);
    }
  };

  // Filter products by search
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.batchNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalManufactured = products.reduce((acc, p) => acc + p.totalQuantity, 0);
  const totalAvailable = products.reduce((acc, p) => acc + p.availableQuantity, 0);
  const totalDistributedToShops = totalManufactured - totalAvailable;

  const highRiskBatchesCount = smartRecallData.filter(
    (b) => b.riskLevel === 'HIGH' || b.riskLevel === 'CRITICAL'
  ).length;

  return (
    <AppLayout>
      <div className="animate-fade-in" style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Header Hero */}
        <div className="card-surface" style={{
          padding: '2rem',
          marginBottom: '2rem',
          borderLeft: '4px solid var(--primary-blue)',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          border: '1px solid #DBEAFE'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <Badge variant="manager" icon={Briefcase}>MANUFACTURER & RECALL CONTROL HUB</Badge>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1E3A8A', letterSpacing: '-0.02em' }}>
                Manufacturer Operations Dashboard
              </h1>
              <p style={{ color: 'var(--text-sub)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                Welcome back, <strong>{user?.name}</strong>. Monitor batch lineages, smart recall risk alerts, warranty complaints, and recall pipelines.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="btn btn-primary"
              >
                <Plus size={16} />
                <span>Add Product Batch</span>
              </button>

              <button
                onClick={() => setShowCreateRecallModal(true)}
                className="btn btn-danger"
              >
                <AlertTriangle size={16} />
                <span>Initiate Recall</span>
              </button>

              <Link
                to="/manager/traceability"
                className="btn btn-secondary"
              >
                <Search size={16} />
                <span>Batch Lineage Search</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Analytics Stat Cards */}
        <div className="dashboard-grid">
          <StatCard
            title="REGISTERED BATCHES"
            value={`${products.length} Batches`}
            subtext={`${totalManufactured} total units manufactured`}
            icon={Package}
            color="purple"
          />

          <StatCard
            title="SMART RECALL ALERTS"
            value={`${highRiskBatchesCount} High/Critical`}
            subtext={`${smartRecallData.length} total batches monitored`}
            icon={Zap}
            color={highRiskBatchesCount > 0 ? 'danger' : 'success'}
          />

          <StatCard
            title="CUSTOMER COMPLAINTS"
            value={`${managerComplaints.length} Logged`}
            subtext="Submitted under active warranty"
            icon={ShieldAlert}
            color="warning"
          />

          <StatCard
            title="ACTIVE RECALLS"
            value={`${recalls.filter((r) => r.status === 'ACTIVE').length} Active`}
            subtext={`${returnRequests.length} customer/shop returns pending`}
            icon={AlertTriangle}
            color="danger"
          />
        </div>

        {/* High Risk Alert Notification Banner */}
        {highRiskBatchesCount > 0 && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }} className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ backgroundColor: '#EF4444', color: '#FFF', padding: '0.5rem', borderRadius: '50%' }}>
                <Zap size={22} />
              </div>
              <div>
                <strong style={{ color: '#991B1B', fontSize: '1rem' }}>
                  ⚠️ Smart Recall Alert: {highRiskBatchesCount} Batch(es) show High or Critical Complaint Risk!
                </strong>
                <div style={{ fontSize: '0.85rem', color: '#7F1D1D', marginTop: '0.15rem' }}>
                  Smart batch analysis has detected repeated customer complaints. Review indicators to decide whether to initiate a recall.
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('smart-recall')}
              className="btn btn-danger btn-sm"
            >
              Review Risk Analysis
            </button>
          </div>
        )}

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

        {/* Tabs Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('products')}
            className={`btn btn-sm ${activeTab === 'products' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Product Catalog ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('smart-recall')}
            className={`btn btn-sm ${activeTab === 'smart-recall' ? 'btn-warning' : 'btn-ghost'}`}
            style={activeTab === 'smart-recall' ? { backgroundColor: '#D97706', color: '#FFF' } : {}}
          >
            <Zap size={14} /> Smart Recall Detection ({smartRecallData.length})
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`btn btn-sm ${activeTab === 'complaints' ? 'btn-secondary' : 'btn-ghost'}`}
          >
            <ShieldAlert size={14} /> Customer Complaints ({managerComplaints.length})
          </button>

          <button
            onClick={() => setActiveTab('recalls')}
            className={`btn btn-sm ${activeTab === 'recalls' ? 'btn-danger' : 'btn-ghost'}`}
          >
            Product Recalls ({recalls.length})
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            className={`btn btn-sm ${activeTab === 'returns' ? 'btn-secondary' : 'btn-ghost'}`}
          >
            Returns Management ({returnRequests.length})
          </button>

          <button
            onClick={() => setActiveTab('shops')}
            className={`btn btn-sm ${activeTab === 'shops' ? 'btn-success' : 'btn-ghost'}`}
          >
            Shops Supplied Ledger ({shopPurchasers.length})
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`btn btn-sm ${activeTab === 'reviews' ? 'btn-outline' : 'btn-ghost'}`}
          >
            Reviews & Ratings ({managerReviews.length})
          </button>
        </div>

        {/* Tab 1: Product Catalog */}
        {activeTab === 'products' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Product Catalog & Batch Inventories
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-sub)' }}>
                  Manage registered products, view ratings, and download batch QR codes.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative', minWidth: '240px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by name or batch..."
                    style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <button onClick={fetchData} className="btn btn-outline btn-sm">
                  <RefreshCw size={14} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {loading ? (
              <TableSkeleton rows={5} cols={6} />
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No Products Registered"
                description="Get started by creating your first product batch."
                actionButton={
                  <button onClick={() => setShowAddProductModal(true)} className="btn btn-primary btn-sm">
                    <Plus size={15} /> Add First Product Batch
                  </button>
                }
              />
            ) : (
              <div className="table-wrapper">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Batch Number</th>
                      <th>Price</th>
                      <th>Rating</th>
                      <th>Stock Availability</th>
                      <th>Distributed</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const sold = p.totalQuantity - p.availableQuantity;
                      const percentAvailable = Math.round((p.availableQuantity / (p.totalQuantity || 1)) * 100);
                      const avgRating = p.averageRating || 0;
                      const numReviews = p.numReviews || 0;

                      return (
                        <tr key={p._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                              <img
                                src={p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                                alt={p.name}
                                style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                              />
                              <div>
                                <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '0.9rem' }}>{p.name}</strong>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {p._id.slice(-6)}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              color: '#0369A1',
                              backgroundColor: '#E0F2FE',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.825rem'
                            }}>
                              {p.batchNo}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            ${p.price}
                          </td>
                          <td>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#FEF3C7', color: '#D97706', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                              <Star size={13} fill="#D97706" color="#D97706" />
                              <span>{avgRating > 0 ? avgRating : 'New'}</span>
                              {numReviews > 0 && <span style={{ color: '#92400E', fontWeight: 500 }}>({numReviews})</span>}
                            </div>
                          </td>
                          <td style={{ minWidth: '160px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', marginBottom: '0.25rem' }}>
                              <span style={{ color: p.availableQuantity > 0 ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 700 }}>
                                {p.availableQuantity} / {p.totalQuantity} avail
                              </span>
                              <span style={{ color: 'var(--text-muted)' }}>{percentAvailable}%</span>
                            </div>
                            <div className="progress-bar-bg">
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${percentAvailable}%`,
                                  backgroundColor: p.availableQuantity > 0 ? 'var(--success-color)' : 'var(--danger-color)'
                                }}
                              />
                            </div>
                          </td>
                          <td style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
                            {sold} units
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => setSelectedQrProduct(p)}
                                className="btn btn-primary btn-sm"
                                title="Generate Batch QR Code"
                              >
                                <QrCode size={14} />
                                <span>QR Code</span>
                              </button>

                              <Link
                                to={`/manager/traceability?batch=${p.batchNo}`}
                                className="btn btn-outline btn-sm"
                              >
                                <Search size={14} />
                                <span>Trace Lineage</span>
                              </Link>
                            </div>
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

        {/* Tab 2: Feature 2 - Smart Recall Detection */}
        {activeTab === 'smart-recall' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={22} color="#D97706" /> Smart Recall Detection & Batch Risk Analysis
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                  Automated risk calculation based on customer complaint rates, total returns, and repeated issue patterns. High risk alerts allow you to review and initiate a recall.
                </p>
              </div>

              <button onClick={fetchData} className="btn btn-outline btn-sm">
                <RefreshCw size={14} /> Re-analyze Batches
              </button>
            </div>

            {smartRecallData.length === 0 ? (
              <EmptyState
                icon={Zap}
                title="No Batch Complaint Data Yet"
                description="When customer complaints are submitted, automated smart recall detection will calculate risk levels here."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {smartRecallData.map((item) => {
                  let badgeStyle = { backgroundColor: '#10B981', color: '#FFF' };
                  if (item.riskLevel === 'CRITICAL') badgeStyle = { backgroundColor: '#7F1D1D', color: '#FFF' };
                  else if (item.riskLevel === 'HIGH') badgeStyle = { backgroundColor: '#DC2626', color: '#FFF' };
                  else if (item.riskLevel === 'MEDIUM') badgeStyle = { backgroundColor: '#D97706', color: '#FFF' };

                  return (
                    <div key={item.batchNo} style={{
                      backgroundColor: item.riskLevel === 'CRITICAL' || item.riskLevel === 'HIGH' ? '#FEF2F2' : '#FFFFFF',
                      border: `1px solid ${item.riskLevel === 'CRITICAL' || item.riskLevel === 'HIGH' ? '#FCA5A5' : 'var(--border-color)'}`,
                      borderRadius: '14px',
                      padding: '1.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '1.1rem',
                              fontWeight: 800,
                              color: '#0369A1',
                              backgroundColor: '#E0F2FE',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px'
                            }}>
                              Batch: {item.batchNo}
                            </span>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                              {item.productName}
                            </h4>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            padding: '0.35rem 0.85rem',
                            borderRadius: '8px',
                            letterSpacing: '0.05em',
                            ...badgeStyle
                          }}>
                            RISK LEVEL: {item.riskLevel}
                          </span>

                          {item.isRecalled ? (
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEE2E2', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                              ⚠️ RECALL INITIATED (#{item.recallId})
                            </span>
                          ) : (
                            <button
                              onClick={() => handleInitiateRecallFromAnalysis(item)}
                              className="btn btn-danger btn-sm"
                            >
                              <AlertTriangle size={15} /> Review & Initiate Recall
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Indicators Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '1rem',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border-color)',
                        padding: '1rem',
                        borderRadius: '10px',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL SOLD</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{item.totalSold} units</div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>COMPLAINTS</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#D97706' }}>
                            {item.totalComplaints} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>({item.complaintRate}%)</span>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RETURNS</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#DC2626' }}>
                            {item.totalReturns} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>({item.returnRate}%)</span>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MAIN ISSUE</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#B45309' }}>{item.mainIssue}</div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AFFECTED CUSTOMERS</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4338CA' }}>{item.affectedCustomersCount}</div>
                        </div>
                      </div>

                      {/* Complaint Type Breakdown */}
                      {Object.keys(item.complaintTypeCounts).length > 0 && (
                        <div style={{ fontSize: '0.825rem', color: 'var(--text-sub)' }}>
                          <strong>Repeated Complaint Types: </strong>
                          {Object.entries(item.complaintTypeCounts).map(([type, count]) => (
                            <span key={type} style={{
                              display: 'inline-block',
                              backgroundColor: '#FEF3C7',
                              color: '#92400E',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '6px',
                              marginRight: '0.5rem',
                              marginTop: '0.25rem',
                              fontSize: '0.78rem',
                              fontWeight: 600
                            }}>
                              {type}: {count}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Customer Complaints Log */}
        {activeTab === 'complaints' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="#D97706" /> Customer Warranty Complaints Log
            </h3>

            {managerComplaints.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No Customer Complaints Logged"
                description="Warranty complaints submitted by customers for your manufactured batches will appear here."
              />
            ) : (
              <div className="table-wrapper">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Complaint Ticket</th>
                      <th>Batch Number</th>
                      <th>Product</th>
                      <th>Customer</th>
                      <th>Complaint Type</th>
                      <th>Warranty Status</th>
                      <th>Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managerComplaints.map((cmp) => (
                      <tr key={cmp._id}>
                        <td style={{ fontFamily: 'var(--font-mono)', color: '#D97706', fontWeight: 700 }}>
                          #{cmp.complaintId}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: '#0369A1' }}>{cmp.batchNo}</td>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{cmp.productName}</td>
                        <td>{cmp.customerId?.name || 'Customer'}</td>
                        <td style={{ color: '#B45309', fontWeight: 700 }}>{cmp.complaintType}</td>
                        <td>
                          <span style={{ fontSize: '0.78rem', backgroundColor: '#F0FDF4', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                            {cmp.warrantyStatus}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(cmp.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Recalls Management */}
        {activeTab === 'recalls' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={20} color="var(--danger-color)" /> Recall Management & Broadcast Control
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-sub)' }}>
                  Initiate product recalls by Batch Number to notify shops and end customers.
                </p>
              </div>

              <button onClick={() => setShowCreateRecallModal(true)} className="btn btn-danger btn-sm">
                <AlertTriangle size={15} /> Initiate New Recall
              </button>
            </div>

            {recalls.length === 0 ? (
              <EmptyState
                icon={AlertTriangle}
                title="No Product Recalls Initiated"
                description="If quality defects occur, broadcast recalls here by specifying the affected batch number."
              />
            ) : (
              <div className="table-wrapper">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Recall Ticket</th>
                      <th>Batch Number</th>
                      <th>Product Name</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Date Broadcast</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recalls.map((r) => (
                      <tr key={r._id}>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger-color)', fontWeight: 700 }}>
                          #{r.recallId}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', color: '#0369A1', fontWeight: 700 }}>
                            {r.batchNo}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{r.productName}</td>
                        <td style={{ color: 'var(--danger-color)', fontWeight: 600 }}>{r.reason}</td>
                        <td>
                          <Badge variant="danger">{r.status}</Badge>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(r.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Returns Management */}
        {activeTab === 'returns' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              Multi-Tier Recalled Stock Returns Verification
            </h3>

            {returnRequests.length === 0 ? (
              <EmptyState
                icon={RotateCcw}
                title="No Recalled Item Returns Received"
                description="When retail shops return recalled stock to your manufacturer account, confirm receipt here."
              />
            ) : (
              <div className="table-wrapper">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Return Ticket</th>
                      <th>Batch Number</th>
                      <th>Product</th>
                      <th>Returning Shop</th>
                      <th>Quantity</th>
                      <th>Pipeline Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnRequests.map((ret) => (
                      <tr key={ret._id}>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-blue)', fontWeight: 700 }}>
                          #{ret.returnId}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: '#0369A1' }}>{ret.batchNo}</td>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ret.productName}</td>
                        <td style={{ color: 'var(--text-main)' }}>{ret.shopId?.name}</td>
                        <td style={{ color: 'var(--success-color)', fontWeight: 700 }}>{ret.quantity} units</td>
                        <td>
                          <Badge variant={ret.status === 'RECEIVED_BY_MANAGER' ? 'success' : 'warning'}>
                            {ret.status}
                          </Badge>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {ret.status === 'RETURNED_TO_MANAGER' ? (
                            <button
                              onClick={() => setConfirmReceiptId(ret._id)}
                              className="btn btn-success btn-sm"
                            >
                              <Check size={14} /> Confirm Receipt
                            </button>
                          ) : ret.status === 'RECEIVED_BY_MANAGER' ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--success-color)', fontWeight: 700 }}>
                              Receipt Confirmed
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Awaiting Shop Dispatch
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Shops Supplied Ledger */}
        {activeTab === 'shops' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              Shops Supplied Retail Wholesale Ledger
            </h3>

            {shopPurchasers.length === 0 ? (
              <EmptyState
                icon={Store}
                title="No Shop Purchases Logged"
                description="Retail shops that purchase stock from your product catalog will be recorded here."
              />
            ) : (
              <div className="table-wrapper">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Shop Name</th>
                      <th>Shop Email</th>
                      <th>Product</th>
                      <th>Batch Number</th>
                      <th>Quantity Purchased</th>
                      <th>Transaction Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopPurchasers.map((sp) => (
                      <tr key={sp._id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{sp.shopId?.name}</td>
                        <td style={{ color: 'var(--text-sub)' }}>{sp.shopId?.email}</td>
                        <td style={{ color: 'var(--text-main)' }}>{sp.productName}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: '#0369A1' }}>{sp.batchNo}</td>
                        <td style={{ color: 'var(--success-color)', fontWeight: 700 }}>{sp.quantity} units</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(sp.purchaseDate).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Reviews & Ratings */}
        {activeTab === 'reviews' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={20} fill="#F59E0B" color="#F59E0B" /> Customer Product Reviews & Ratings
            </h3>

            {managerReviews.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No Product Reviews Yet"
                description="Customer reviews for products manufactured by your brand will appear here."
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {managerReviews.map((rev) => (
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
                      <span>Customer: {rev.customerId?.name || 'Customer'}</span>
                      <span>Batch: {rev.batchNo}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Add Product Batch */}
        <Modal
          isOpen={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          title="Register New Product Batch"
        >
          <form onSubmit={handleAddProduct}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Product Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. POCO X3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Batch Number (Unique)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. POCO-B001"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                required
                style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Unit Price ($)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="200"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Total Manufactured Quantity</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="300"
                  min="1"
                  value={totalQuantity}
                  onChange={(e) => setTotalQuantity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Product Description (Optional)</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Brief specs or manufacturing notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Image URL (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setShowAddProductModal(false)} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={submittingProduct} className="btn btn-primary">
                {submittingProduct ? 'Registering...' : 'Create Product & Batch'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Initiate Product Recall */}
        <Modal
          isOpen={showCreateRecallModal}
          onClose={() => setShowCreateRecallModal(false)}
          title="Initiate Product Recall"
        >
          <form onSubmit={handleCreateRecall}>
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '0.85rem', borderRadius: '8px', color: '#991B1B', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <strong>⚠️ Warning:</strong> Initiating a recall will immediately dispatch alert notifications to all retail shops holding stock and all customers who purchased this batch.
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Target Batch Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. POCO-B001"
                value={recallBatchNo}
                onChange={(e) => setRecallBatchNo(e.target.value)}
                required
                style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Recall Reason</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Battery overheating hazard / Component defect"
                value={recallReason}
                onChange={(e) => setRecallReason(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Recall Instructions for Shops & Customers</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Please return purchased items to your original purchase shop for a full refund..."
                value={recallMessage}
                onChange={(e) => setRecallMessage(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setShowCreateRecallModal(false)} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={submittingRecall} className="btn btn-danger">
                {submittingRecall ? 'Broadcasting Recall...' : 'Broadcast Product Recall'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Confirm Receipt of Returned Recalled Stock */}
        <ConfirmDialog
          isOpen={!!confirmReceiptId}
          onClose={() => setConfirmReceiptId(null)}
          onConfirm={handleConfirmReceipt}
          loading={confirmingReceipt}
          title="Confirm Receipt of Returned Stock"
          message="Are you sure you have received and verified the returned recalled stock from the retail shop? This will mark the return request as completed."
        />

        {/* Modal: Batch QR Code */}
        <BatchQRCodeModal
          isOpen={!!selectedQrProduct}
          onClose={() => setSelectedQrProduct(null)}
          batchNo={selectedQrProduct?.batchNo}
          productName={selectedQrProduct?.name}
          managerName={user?.name}
        />

      </div>
    </AppLayout>
  );
};

export default ManagerDashboard;
