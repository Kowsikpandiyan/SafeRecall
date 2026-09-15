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
  X
} from 'lucide-react';

const ShopDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers' | 'inventory' | 'orders' | 'recalls'

  // Data states
  const [managers, setManagers] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [managerProducts, setManagerProducts] = useState([]);
  const [shopInventory, setShopInventory] = useState([]);
  const [shopOrders, setShopOrders] = useState([]);
  const [recalls, setRecalls] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Purchase state
  const [buyQtyMap, setBuyQtyMap] = useState({});
  const [buyingId, setBuyingId] = useState(null);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      const [mgrRes, invRes, ordRes, recallRes, returnRes] = await Promise.all([
        API.get('/products/managers'),
        API.get('/shop/inventory'),
        API.get('/orders/shop-orders'),
        API.get('/recalls'),
        API.get('/returns')
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
    setError('');
    setSuccessMsg('');

    const qty = Number(buyQtyMap[productId] || 10);
    if (qty <= 0) {
      setError('Please enter a valid positive quantity');
      return;
    }

    try {
      setBuyingId(productId);
      const res = await API.post('/shop/purchases', {
        productId,
        quantity: qty
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message);
        fetchInitialData();
        if (selectedManagerId) fetchManagerProducts(selectedManagerId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Stock purchase failed');
    } finally {
      setBuyingId(null);
    }
  };

  // Shop responds to Customer return request (Accept / Reject)
  const handleRespondCustomerReturn = async (returnId, status) => {
    try {
      setError('');
      setSuccessMsg('');
      const res = await API.patch(`/returns/shop/${returnId}`, { status });
      if (res.data.success) {
        setSuccessMsg(`Return request status updated to '${status}'!`);
        fetchInitialData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update return request');
    }
  };

  // Shop returns collected recalled products to Manager
  const handleReturnToManager = async (returnRequestId) => {
    try {
      setError('');
      setSuccessMsg('');
      const res = await API.post('/returns/shop-to-manager', { returnRequestId });
      if (res.data.success) {
        setSuccessMsg('Recalled products dispatched back to manufacturer!');
        fetchInitialData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return recalled products to manager');
    }
  };

  const totalShopUnits = shopInventory.reduce((sum, item) => sum + item.availableQuantity, 0);

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-fade-in" style={{ maxWidth: '1300px', margin: '0 auto' }}>
        
        {/* Header Hero Banner */}
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
                <Badge variant="shop" icon={Store}>RETAIL SHOP DISTRIBUTOR HUB</Badge>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1E3A8A', letterSpacing: '-0.02em' }}>
                Shop Operations & Supply Distribution
              </h1>
              <p style={{ color: 'var(--text-sub)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                Welcome, <strong>{user?.name}</strong>. Acquire manufacturer stock, manage local shop inventory, process customer orders, and handle recall returns.
              </p>
            </div>

            <button onClick={fetchInitialData} className="btn btn-outline">
              <RefreshCw size={15} />
              <span>Refresh Operations</span>
            </button>
          </div>
        </div>

        {/* Analytics Stat Cards */}
        <div className="dashboard-grid">
          <StatCard
            title="AVAILABLE SHOP INVENTORY"
            value={`${totalShopUnits} Units`}
            subtext={`${shopInventory.length} unique product batches`}
            icon={Layers}
            color="success"
          />

          <StatCard
            title="CUSTOMER ORDERS RECEIVED"
            value={`${shopOrders.length} Orders`}
            subtext="Fulfilled via retail marketplace"
            icon={ShoppingCart}
            color="info"
          />

          <StatCard
            title="ACTIVE RECALL ALERTS"
            value={`${recalls.length} Alerts`}
            subtext="Batches in your inventory"
            icon={AlertTriangle}
            color={recalls.length > 0 ? 'danger' : 'success'}
          />

          <StatCard
            title="PENDING RETURN REQUESTS"
            value={`${returnRequests.filter((r) => r.status === 'PENDING').length} Pending`}
            subtext="Awaiting shop verification"
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

        {/* Tab 1: Purchase from Managers */}
        {activeTab === 'suppliers' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
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

        {/* Tab 3: Customer Orders */}
        {activeTab === 'orders' && (
          <div className="card-surface" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              Customer Orders Received by Shop
            </h3>

            {shopOrders.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="No Customer Orders Yet"
                description="Orders placed by customers in the retail marketplace will be tracked here."
              />
            ) : (
              <div className="table-wrapper">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Name</th>
                      <th>Product</th>
                      <th>Batch Number</th>
                      <th>Quantity</th>
                      <th>Total Cost</th>
                      <th>Order Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopOrders.map((ord) => (
                      <tr key={ord._id}>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-blue)', fontWeight: 700 }}>
                          #{ord.orderId}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ord.customerId?.name}</td>
                        <td style={{ color: 'var(--text-main)' }}>{ord.productName}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: '#0369A1' }}>{ord.batchNo}</td>
                        <td style={{ color: 'var(--success-color)', fontWeight: 700 }}>{ord.quantity} units</td>
                        <td style={{ color: 'var(--text-main)', fontWeight: 700 }}>${ord.totalAmount}</td>
                        <td>
                          <Badge variant={ord.status === 'RECALLED' ? 'danger' : 'success'}>
                            {ord.status}
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

      </div>
    </AppLayout>
  );
};

export default ShopDashboard;
