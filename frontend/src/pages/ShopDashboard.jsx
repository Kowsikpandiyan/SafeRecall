import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import AppLayout from '../components/AppLayout';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import OrderTracker from '../components/ui/OrderTracker';
import { TableSkeleton } from '../components/ui/Skeleton';
import {
  Store,
  ShoppingCart,
  Package,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Layers,
  RotateCcw,
  Briefcase,
  Check,
  X,
  Star,
  Truck,
  MessageSquare
} from 'lucide-react';

const ShopDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers' | 'inventory' | 'orders' | 'recalls' | 'reviews'

  // Data states
  const [managers, setManagers] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [managerProducts, setManagerProducts] = useState([]);
  const [shopInventory, setShopInventory] = useState([]);
  const [shopOrders, setShopOrders] = useState([]);
  const [recalls, setRecalls] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [shopReviews, setShopReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Purchase state
  const [buyQtyMap, setBuyQtyMap] = useState({});
  const [buyingId, setBuyingId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      const [mgrRes, invRes, ordRes, recallRes, returnRes, revRes] = await Promise.all([
        API.get('/products/managers'),
        API.get('/shop/inventory'),
        API.get('/orders/shop-orders'),
        API.get('/recalls'),
        API.get('/returns'),
        API.get('/reviews/shop')
      ]);

      if (mgrRes.data.success) {
        setManagers(mgrRes.data.managers);
        if (mgrRes.data.managers.length > 0 && !selectedManagerId) {
          setSelectedManagerId(mgrRes.data.managers[0]._id);
        }
      }
      if (invRes.data.success) setShopInventory(invRes.data.inventory);
      if (ordRes.data.success) setShopOrders(ordRes.data.orders);
      if (recallRes.data.success) setRecalls(recallRes.data.recalls);
      if (returnRes.data.success) setReturnRequests(returnRes.data.returnRequests);
      if (revRes.data.success) setShopReviews(revRes.data.reviews);
    } catch (err) {
      console.error('Fetch shop dashboard data error:', err);
      setError('Failed to load shop operations data');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagerProducts = async (managerId) => {
    if (!managerId) return;
    try {
      const res = await API.get(`/products/manager/${managerId}`);
      if (res.data.success) {
        setManagerProducts(res.data.products);
      }
    } catch (err) {
      console.error('Fetch manager products error:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedManagerId) {
      fetchManagerProducts(selectedManagerId);
    }
  }, [selectedManagerId]);

  // Shop purchases stock from Manager
  const handleBuyFromManager = async (productId) => {
    const qty = Number(buyQtyMap[productId] || 10);
    if (!selectedManagerId || !productId || qty <= 0) return;

    try {
      setBuyingId(productId);
      setError('');
      setSuccessMsg('');

      const res = await API.post('/shop/purchases', {
        managerId: selectedManagerId,
        productId,
        quantity: qty
      });

      if (res.data.success) {
        setSuccessMsg(`Successfully purchased ${qty} units from Manager! Stock added to Shop Inventory.`);
        fetchInitialData();
        fetchManagerProducts(selectedManagerId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to purchase stock from Manager');
    } finally {
      setBuyingId(null);
    }
  };

  // Shop updates Customer Order status (ORDER PLACED -> PROCESSING -> SHIPPED -> DELIVERED)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setError('');
      setSuccessMsg('');

      const res = await API.patch(`/orders/${orderId}/status`, { status: newStatus });

      if (res.data.success) {
        setSuccessMsg(`Order status updated to '${newStatus}'! Customer notified.`);
        fetchInitialData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Shop accepts/rejects Customer Return
  const handleRespondCustomerReturn = async (returnId, status) => {
    try {
      setError('');
      setSuccessMsg('');

      const res = await API.patch(`/returns/shop/${returnId}`, { status });
      if (res.data.success) {
        setSuccessMsg(`Customer Return Request updated: ${status}`);
        fetchInitialData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to respond to return request');
    }
  };

  // Shop dispatches accepted returned stock to Manager
  const handleReturnToManager = async (returnId) => {
    try {
      setError('');
      setSuccessMsg('');

      const res = await API.post(`/returns/shop-to-manager/${returnId}`);
      if (res.data.success) {
        setSuccessMsg('Recalled stock returned back to original Manufacturer Manager!');
        fetchInitialData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return stock to manager');
    }
  };

  return (
    <AppLayout>
      <div className="animate-fade-in" style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Header Hero */}
        <div className="card-surface" style={{
          padding: '2rem',
          marginBottom: '2rem',
          borderLeft: '4px solid var(--success-color)',
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          border: '1px solid #A7F3D0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <Badge variant="shop" icon={Store}>RETAIL DISTRIBUTOR SHOP</Badge>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#065F46', letterSpacing: '-0.02em' }}>
                {user?.name || 'Shop Portal'} Operations Dashboard
              </h1>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem' }}>
                Manage inventory stock, update order tracking statuses, process recall alerts, and inspect customer feedback.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="dashboard-grid">
          <StatCard
            title="SHOP INVENTORY ITEMS"
            value={shopInventory.length}
            subtext={`${shopInventory.reduce((s, i) => s + i.availableQuantity, 0)} total sellable units`}
            icon={Layers}
            color="success"
          />
          <StatCard
            title="CUSTOMER ORDERS"
            value={shopOrders.length}
            subtext="Orders processed for customers"
            icon={ShoppingCart}
            color="info"
          />
          <StatCard
            title="RECALL ALERTS"
            value={recalls.length}
            subtext="Manufacturing recalls active"
            icon={AlertTriangle}
            color={recalls.length > 0 ? 'danger' : 'success'}
          />
          <StatCard
            title="CUSTOMER REVIEWS"
            value={shopReviews.length}
            subtext="Reviews for sold products"
            icon={Star}
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

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`btn btn-sm ${activeTab === 'suppliers' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Buy Manufacturer Stock ({managers.length} Suppliers)
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`btn btn-sm ${activeTab === 'inventory' ? 'btn-success' : 'btn-ghost'}`}
          >
            My Shop Inventory ({shopInventory.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`btn btn-sm ${activeTab === 'orders' ? 'btn-secondary' : 'btn-ghost'}`}
          >
            Customer Orders & Tracking ({shopOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('recalls')}
            className={`btn btn-sm ${activeTab === 'recalls' ? 'btn-danger' : 'btn-ghost'}`}
          >
            Recall Alerts & Returns ({recalls.length})
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`btn btn-sm ${activeTab === 'reviews' ? 'btn-outline' : 'btn-ghost'}`}
          >
            Product Reviews ({shopReviews.length})
          </button>
        </div>

        {/* Tab 1: Buy Stock from Manufacturers */}
        {activeTab === 'suppliers' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Acquire Stock from Manufacturer Suppliers
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-sub)' }}>
                  Select a registered Manufacturer Supplier to view available product batches and purchase stock.
                </p>
              </div>

              {/* Manager Selector */}
              <div style={{ minWidth: '280px' }}>
                <select
                  className="form-select"
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  style={{ fontWeight: 700 }}
                >
                  {managers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {managers.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No Manufacturer Suppliers Registered"
                description="Once a Manager registers and adds products, their catalog will appear here."
              />
            ) : managerProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No Available Products in Selected Manufacturer Catalog"
                description="This Manager has no registered product batches available for purchase."
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {managerProducts.map((p) => {
                  const qtyToBuy = buyQtyMap[p._id] || 10;
                  const isOutOfStock = p.availableQuantity <= 0;
                  const totalCost = qtyToBuy * p.price;

                  return (
                    <div key={p._id} className="card-surface card-surface-hover" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: '#0369A1',
                          backgroundColor: '#E0F2FE',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.775rem'
                        }}>
                          BATCH: {p.batchNo}
                        </span>
                        <Badge variant={isOutOfStock ? 'danger' : 'success'}>
                          {p.availableQuantity} AVAIL
                        </Badge>
                      </div>

                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                        {p.name}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '1rem' }}>
                        Unit Price: <strong style={{ color: 'var(--text-main)' }}>${p.price}</strong>
                      </p>

                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                          <label style={{ fontSize: '0.825rem', color: 'var(--text-sub)', fontWeight: 600 }}>Quantity to Buy:</label>
                          <input
                            type="number"
                            className="form-input"
                            min="1"
                            max={p.availableQuantity}
                            style={{ width: '90px', padding: '0.35rem 0.6rem', fontSize: '0.85rem', textAlign: 'center' }}
                            value={qtyToBuy}
                            onChange={(e) => setBuyQtyMap({ ...buyQtyMap, [p._id]: e.target.value })}
                          />
                        </div>

                        <button
                          onClick={() => handleBuyFromManager(p._id)}
                          disabled={isOutOfStock || buyingId === p._id}
                          className="btn btn-primary"
                          style={{ width: '100%' }}
                        >
                          {buyingId === p._id ? 'Processing Purchase...' : `Purchase Stock ($${totalCost})`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Shop Inventory */}
        {activeTab === 'inventory' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              Independent Shop Inventory
            </h3>

            {shopInventory.length === 0 ? (
              <EmptyState
                icon={Layers}
                title="Shop Inventory Empty"
                description="Acquire stock from Manufacturer Suppliers above to populate your shop inventory catalog."
              />
            ) : (
              <div className="table-wrapper">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Batch Number</th>
                      <th>Manufacturer Supplier</th>
                      <th>Unit Price</th>
                      <th>Sellable Stock</th>
                      <th>Recalled Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopInventory.map((item) => (
                      <tr key={item._id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {item.productId?.name}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', color: '#0369A1', fontWeight: 700 }}>
                            {item.batchNo}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-sub)' }}>
                          {item.managerId?.name}
                        </td>
                        <td style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                          ${item.unitPrice}
                        </td>
                        <td style={{ color: 'var(--success-color)', fontWeight: 700 }}>
                          {item.availableQuantity} / {item.quantity} available
                        </td>
                        <td>
                          <Badge variant={item.recalledQuantity > 0 ? 'danger' : 'neutral'}>
                            {item.recalledQuantity || 0} recalled
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Customer Orders & Tracking Management */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {shopOrders.length === 0 ? (
              <div className="card-surface" style={{ padding: '2rem' }}>
                <EmptyState
                  icon={ShoppingCart}
                  title="No Customer Orders Yet"
                  description="Orders placed by customers in the retail marketplace will be tracked here."
                />
              </div>
            ) : (
              shopOrders.map((ord) => (
                <div key={ord._id} className="card-surface" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                  {/* Header info */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order ID: </span>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-blue)', fontSize: '1.05rem' }}>#{ord.orderId}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '1rem' }}>
                        Customer: <strong style={{ color: 'var(--text-main)' }}>{ord.customerId?.name}</strong> ({ord.customerId?.email})
                      </span>
                    </div>

                    {/* Order Status Update Control */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-sub)' }}>Update Status:</span>
                      <select
                        className="form-select"
                        value={ord.status || 'ORDER PLACED'}
                        onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                        disabled={updatingOrderId === ord._id || ord.status === 'RECALLED' || ord.status === 'RETURNED'}
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF', backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', width: 'auto' }}
                      >
                        <option value="ORDER PLACED">ORDER PLACED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </div>
                  </div>

                  {/* Order Line Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PRODUCT & BATCH</div>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{ord.productName}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', color: '#0369A1', fontSize: '0.8rem' }}>Batch: {ord.batchNo}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>QUANTITY & AMOUNT</div>
                      <div style={{ color: 'var(--success-color)', fontWeight: 700 }}>{ord.quantity} units</div>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>${ord.totalAmount} (${ord.price}/unit)</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ORDER DATE</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{new Date(ord.orderDate || ord.createdAt).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Visual Stepper */}
                  <OrderTracker status={ord.status} orderDate={ord.orderDate} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Recalls & Customer Returns */}
        {activeTab === 'recalls' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Active Recall Alerts */}
            <div className="card-surface" style={{ padding: '1.5rem', borderLeft: '4px solid var(--danger-color)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} color="var(--danger-color)" /> Product Recall Alerts Received from Manufacturers
              </h3>

              {recalls.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No active recall alerts for batches in your shop inventory.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recalls.map((r) => (
                    <div key={r._id} style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <Badge variant="danger">RECALL #{r.recallId}</Badge>
                        <strong style={{ fontFamily: 'var(--font-mono)', color: '#991B1B' }}>BATCH: {r.batchNo}</strong>
                      </div>
                      <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 800 }}>{r.productName}</h4>
                      <p style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginTop: '0.2rem' }}>Reason: {r.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Return Verification & Return to Manager Workflow */}
            <div className="card-surface" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
                Customer Return Verification & Manufacturer Dispatch Workflow
              </h3>

              {returnRequests.length === 0 ? (
                <EmptyState
                  icon={RotateCcw}
                  title="No Return Requests Logged"
                  description="Customer recall return requests submitted to your shop will appear here."
                />
              ) : (
                <div className="table-wrapper">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>Return ID</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Batch No</th>
                        <th>Qty</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnRequests.map((ret) => (
                        <tr key={ret._id}>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-blue)', fontWeight: 700 }}>
                            #{ret.returnId}
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ret.customerId?.name}</td>
                          <td style={{ color: 'var(--text-main)' }}>{ret.productName}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: '#0369A1' }}>{ret.batchNo}</td>
                          <td style={{ color: 'var(--success-color)', fontWeight: 700 }}>{ret.quantity} units</td>
                          <td>
                            <Badge variant={ret.status === 'ACCEPTED_BY_SHOP' ? 'success' : 'warning'}>
                              {ret.status}
                            </Badge>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              {ret.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleRespondCustomerReturn(ret._id, 'ACCEPTED_BY_SHOP')}
                                    className="btn btn-success btn-sm"
                                  >
                                    <Check size={14} /> Accept
                                  </button>
                                  <button
                                    onClick={() => handleRespondCustomerReturn(ret._id, 'REJECTED_BY_SHOP')}
                                    className="btn btn-outline btn-sm"
                                    style={{ color: 'var(--danger-color)' }}
                                  >
                                    <X size={14} /> Reject
                                  </button>
                                </>
                              )}

                              {ret.status === 'ACCEPTED_BY_SHOP' && (
                                <button
                                  onClick={() => handleReturnToManager(ret._id)}
                                  className="btn btn-primary btn-sm"
                                >
                                  Return to Manager
                                </button>
                              )}

                              {(ret.status === 'RETURNED_TO_MANAGER' || ret.status === 'RECEIVED_BY_MANAGER') && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--success-color)', fontWeight: 700 }}>
                                  Dispatched to Manufacturer
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 5: Product Reviews */}
        {activeTab === 'reviews' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={20} fill="#F59E0B" color="#F59E0B" /> Customer Reviews & Ratings for Sold Products
            </h3>

            {shopReviews.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No Product Reviews Yet"
                description="Customer reviews for products sold by your shop will be listed here once submitted."
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {shopReviews.map((rev) => (
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

      </div>
    </AppLayout>
  );
};

export default ShopDashboard;
