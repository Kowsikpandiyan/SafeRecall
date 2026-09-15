import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import AppLayout from '../components/AppLayout';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
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
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'recalls' | 'returns' | 'shops'

  const [products, setProducts] = useState([]);
  const [recalls, setRecalls] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [shopPurchasers, setShopPurchasers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showCreateRecallModal, setShowCreateRecallModal] = useState(false);
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
      const [prodRes, recallRes, returnRes, shopRes] = await Promise.all([
        API.get('/products/my-products'),
        API.get('/recalls'),
        API.get('/returns'),
        API.get('/shop/manager-purchasers')
      ]);

      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (recallRes.data.success) setRecalls(recallRes.data.recalls);
      if (returnRes.data.success) setReturnRequests(returnRes.data.returnRequests);
      if (shopRes.data.success) setShopPurchasers(shopRes.data.purchases);
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
        image,
        price: Number(price),
        batchNo: batchNo.trim().toUpperCase(),
        totalQuantity: Number(totalQuantity)
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setName('');
        setDescription('');
        setImage('');
        setPrice('');
        setBatchNo('');
        setTotalQuantity('');
        setShowAddProductModal(false);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product batch');
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Manager Initiates Product Recall
  const handleCreateRecall = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!recallBatchNo || !recallReason || !recallMessage) {
      setError('Please provide Batch Number, Reason, and Message for the product recall');
      return;
    }

    try {
      setSubmittingRecall(true);
      const res = await API.post('/recalls', {
        batchNo: recallBatchNo.trim().toUpperCase(),
        reason: recallReason,
        message: recallMessage
      });

      if (res.data.success) {
        setSuccessMsg(`Recall #${res.data.recall.recallId} broadcasted! ${res.data.affectedMetrics.totalNotificationsDispatched} Shops & Customers automatically notified.`);
        setRecallBatchNo('');
        setRecallReason('');
        setRecallMessage('');
        setShowCreateRecallModal(false);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate recall broadcast');
    } finally {
      setSubmittingRecall(false);
    }
  };

  // Manager Confirms Return Receipt from Shop
  const handleConfirmReceiveReturn = async () => {
    if (!confirmReceiptId) return;
    try {
      setConfirmingReceipt(true);
      const res = await API.patch(`/returns/manager/${confirmReceiptId}`);
      if (res.data.success) {
        setSuccessMsg('Confirmed receipt of returned recalled stock!');
        setConfirmReceiptId(null);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm return receipt');
    } finally {
      setConfirmingReceipt(false);
    }
  };

  const totalManufactured = products.reduce((sum, p) => sum + p.totalQuantity, 0);
  const totalAvailable = products.reduce((sum, p) => sum + p.availableQuantity, 0);
  const totalDistributedToShops = totalManufactured - totalAvailable;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.batchNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-fade-in" style={{ maxWidth: '1300px', margin: '0 auto' }}>
        
        {/* Header Hero Card */}
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
                Welcome back, <strong>{user?.name}</strong>. Create products with Batch Numbers, monitor distribution across Shops, and initiate recalls.
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
            title="AVAILABLE MANAGER STOCK"
            value={`${totalAvailable} Units`}
            subtext="Ready for shop distribution"
            icon={Layers}
            color="success"
          />

          <StatCard
            title="DISTRIBUTED TO SHOPS"
            value={`${totalDistributedToShops} Units`}
            subtext="Acquired across retail shops"
            icon={Store}
            color="info"
          />

          <StatCard
            title="ACTIVE RECALLS"
            value={`${recalls.filter((r) => r.status === 'ACTIVE').length} Active`}
            subtext={`${returnRequests.length} customer/shop returns pending`}
            icon={AlertTriangle}
            color="danger"
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

        {/* Tab 1: Product Catalog */}
        {activeTab === 'products' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Product Catalog & Batch Inventories
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-sub)' }}>
                  Manage registered products and inspect stock distribution to retail shops.
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
              <TableSkeleton rows={5} cols={5} />
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
                      <th>Stock Availability</th>
                      <th>Distributed to Shops</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const sold = p.totalQuantity - p.availableQuantity;
                      const percentAvailable = Math.round((p.availableQuantity / (p.totalQuantity || 1)) * 100);

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
                          <td style={{ minWidth: '180px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', marginBottom: '0.25rem' }}>
                              <span style={{ color: p.availableQuantity > 0 ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 700 }}>
                                {p.availableQuantity} / {p.totalQuantity} available
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
                            {sold} units sold
                          </td>
                          <td>
                            <Link
                              to={`/manager/traceability?batch=${p.batchNo}`}
                              className="btn btn-outline btn-sm"
                            >
                              <Search size={14} />
                              <span>Trace Lineage</span>
                            </Link>
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

        {/* Tab 2: Recalls Management */}
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
                description="When a batch defect occurs, use the recall button to broadcast a recall alert across the supply chain."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {recalls.map((r) => (
                  <div key={r._id} style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <Badge variant="danger">RECALL ID #{r.recallId}</Badge>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#991B1B', fontSize: '0.85rem' }}>
                        TARGET BATCH: {r.batchNo}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                      {r.productName}
                    </h4>

                    <p style={{ fontSize: '0.875rem', color: 'var(--danger-color)', marginBottom: '0.5rem', fontWeight: 600 }}>
                      Defect Reason: {r.reason}
                    </p>

                    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Recall Message: </span>
                      <span style={{ color: 'var(--text-sub)' }}>{r.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Returns Management */}
        {activeTab === 'returns' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              Returned Stock Tracking & Confirmations
            </h3>

            {returnRequests.length === 0 ? (
              <EmptyState
                icon={RotateCcw}
                title="No Return Requests Logged"
                description="Recalled product returns submitted by Shops will appear here for manufacturer confirmation."
              />
            ) : (
              <div className="table-wrapper">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Return ID</th>
                      <th>Product</th>
                      <th>Batch Number</th>
                      <th>Customer Source</th>
                      <th>Shop Source</th>
                      <th>Quantity</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnRequests.map((ret) => (
                      <tr key={ret._id}>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-blue)', fontWeight: 700 }}>
                          #{ret.returnId}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ret.productName}</td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', color: '#0369A1', fontWeight: 700 }}>
                            {ret.batchNo}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-sub)' }}>{ret.customerId?.name || 'Customer'}</td>
                        <td style={{ color: 'var(--text-sub)' }}>{ret.shopId?.name || 'Shop'}</td>
                        <td style={{ color: 'var(--text-main)', fontWeight: 700 }}>{ret.quantity} units</td>
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
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {ret.status === 'RECEIVED_BY_MANAGER' ? 'Completed' : 'Pending Shop'}
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

        {/* Tab 4: Supplied Shops */}
        {activeTab === 'shops' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              Shops Supplied with Manager Stock
            </h3>

            {shopPurchasers.length === 0 ? (
              <EmptyState
                icon={Store}
                title="No Shop Purchases Yet"
                description="No retail shops have purchased stock from your manufacturer catalog yet."
              />
            ) : (
              <div className="table-wrapper">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Purchase Date</th>
                      <th>Shop Name</th>
                      <th>Email / Contact</th>
                      <th>Product</th>
                      <th>Batch No</th>
                      <th>Quantity Purchased</th>
                      <th>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopPurchasers.map((sp) => (
                      <tr key={sp._id}>
                        <td style={{ color: 'var(--text-sub)' }}>
                          {new Date(sp.purchaseDate).toLocaleDateString()}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {sp.shopId?.name || 'Shop Member'}
                        </td>
                        <td style={{ color: 'var(--text-sub)' }}>
                          {sp.shopId?.email}
                        </td>
                        <td style={{ color: 'var(--text-main)' }}>
                          {sp.productId?.name}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: '#0369A1', fontWeight: 700 }}>
                          {sp.batchNo}
                        </td>
                        <td style={{ color: 'var(--success-color)', fontWeight: 700 }}>
                          {sp.quantity} units
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          ${sp.totalPrice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Product Modal */}
        <Modal
          isOpen={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          title="Add Product & Batch Registration"
          maxWidth="560px"
        >
          <form onSubmit={handleAddProduct}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. POCO X3 Smartphone"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Batch Number *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. BATCH-2026-X1"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
                required
              />
              <span className="form-helper">Unique batch code for end-to-end supply chain traceability.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Unit Price ($) *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="299"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Manufactured Qty *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="500"
                  value={totalQuantity}
                  onChange={(e) => setTotalQuantity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Product Specifications / Notes</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Manufacturing details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowAddProductModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submittingProduct}>
                {submittingProduct ? 'Creating Batch...' : 'Register Product Batch'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Create Recall Modal */}
        <Modal
          isOpen={showCreateRecallModal}
          onClose={() => setShowCreateRecallModal(false)}
          title="Initiate Product Batch Recall"
          maxWidth="560px"
        >
          <form onSubmit={handleCreateRecall}>
            <div className="form-group">
              <label className="form-label">Target Batch Number *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. BATCH-2026-X1"
                value={recallBatchNo}
                onChange={(e) => setRecallBatchNo(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Recall Reason *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Hardware defect identified during QA testing"
                value={recallReason}
                onChange={(e) => setRecallReason(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Recall Message Instructions *</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Stop distribution immediately and submit return requests..."
                value={recallMessage}
                onChange={(e) => setRecallMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowCreateRecallModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-danger" disabled={submittingRecall}>
                {submittingRecall ? 'Broadcasting...' : 'Broadcast Recall Alert'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Confirm Receipt Dialog */}
        <ConfirmDialog
          isOpen={!!confirmReceiptId}
          onClose={() => setConfirmReceiptId(null)}
          onConfirm={handleConfirmReceiveReturn}
          title="Confirm Return Receipt"
          message="Are you sure you have received the returned recalled stock from the shop?"
          confirmText="Confirm Receipt"
          loading={confirmingReceipt}
        />

      </div>
    </AppLayout>
  );
};

export default ManagerDashboard;
