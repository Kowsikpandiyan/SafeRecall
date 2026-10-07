import React, { useState, useEffect } from 'react';
import API from '../services/api';
import AppLayout from '../components/AppLayout';
import ProductFlipCard from '../components/ProductFlipCard';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { Search, ShoppingBag, CheckCircle2, AlertCircle, RefreshCw, X, Store, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CustomerMarketplace = () => {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShopId, setSelectedShopId] = useState('');

  // Purchase Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [customerPhone, setCustomerPhone] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  // Fetch all registered shops (persists across filters/searches)
  const fetchShops = async () => {
    try {
      // 1. Try dedicated endpoint first
      const res = await API.get('/marketplace/shops');
      if (res.data.success && Array.isArray(res.data.shops)) {
        setShops((prev) => {
          const shopMap = new Map();
          res.data.shops.forEach((s) => {
            const idStr = (s._id || s.id).toString();
            shopMap.set(idStr, {
              id: idStr,
              name: s.name,
              email: s.email
            });
          });
          prev.forEach((s) => {
            if (!shopMap.has(s.id)) {
              shopMap.set(s.id, s);
            }
          });
          return Array.from(shopMap.values());
        });
        return;
      }
    } catch (e) {
      // Endpoint might not be loaded if server hasn't restarted yet
    }

    try {
      // 2. Fallback: Query all products without filter to discover all active shops
      const res = await API.get('/marketplace/products');
      if (res.data.success) {
        const shopMap = new Map();
        if (Array.isArray(res.data.allShops)) {
          res.data.allShops.forEach((s) => {
            if (s._id) {
              const idStr = s._id.toString();
              shopMap.set(idStr, { id: idStr, name: s.name, email: s.email });
            }
          });
        }
        if (Array.isArray(res.data.marketplaceItems)) {
          res.data.marketplaceItems.forEach((it) => {
            if (it.shopId && it.shopId._id) {
              const idStr = it.shopId._id.toString();
              if (!shopMap.has(idStr)) {
                shopMap.set(idStr, {
                  id: idStr,
                  name: it.shopId.name,
                  email: it.shopId.email
                });
              }
            }
          });
        }
        setShops(Array.from(shopMap.values()));
      }
    } catch (err) {
      console.warn('Initial shops discovery fallback error:', err);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchMarketplace = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedShopId) params.shopId = selectedShopId;

      const res = await API.get('/marketplace/products', { params });
      if (res.data.success) {
        setItems(res.data.marketplaceItems);

        // Safely merge shops without wiping existing shop profiles
        setShops((prevShops) => {
          const shopMap = new Map();
          // Keep all existing registered shops
          prevShops.forEach((s) => shopMap.set(s.id, s));

          // If backend returned allShops list
          if (Array.isArray(res.data.allShops)) {
            res.data.allShops.forEach((s) => {
              if (s._id) {
                const idStr = s._id.toString();
                shopMap.set(idStr, {
                  id: idStr,
                  name: s.name,
                  email: s.email
                });
              }
            });
          }

          // Also merge any shops found in items
          if (Array.isArray(res.data.marketplaceItems)) {
            res.data.marketplaceItems.forEach((it) => {
              if (it.shopId && it.shopId._id) {
                const idStr = it.shopId._id.toString();
                if (!shopMap.has(idStr)) {
                  shopMap.set(idStr, {
                    id: idStr,
                    name: it.shopId.name,
                    email: it.shopId.email
                  });
                }
              }
            });
          }

          return Array.from(shopMap.values());
        });
      }
    } catch (err) {
      console.error('Marketplace fetch error:', err);
      setError('Failed to load marketplace products catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplace();
  }, [selectedShopId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMarketplace();
  };

  const openBuyModal = (item) => {
    setSelectedItem(item);
    setBuyQuantity(1);
    setCustomerPhone(user?.phone || '');
    setError('');
    setSuccessMsg('');
  };

  const handleConfirmPurchase = async () => {
    if (!selectedItem || !buyQuantity || buyQuantity <= 0) return;

    if (!user) {
      setError('Please log in as a Customer to purchase products.');
      return;
    }

    try {
      setPurchasing(true);
      setError('');
      const res = await API.post('/orders', {
        shopInventoryId: selectedItem._id,
        quantity: Number(buyQuantity),
        phone: customerPhone || user?.phone || ''
      });

      if (res.data.success) {
        setSuccessMsg(`🎉 Order #${res.data.order.orderId} confirmed! Purchased ${buyQuantity} units from ${selectedItem.shopId?.name}.`);
        setSelectedItem(null);
        fetchMarketplace();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Purchase rejected. Requested stock unavailable.');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <AppLayout>
      <div className="animate-fade-in" style={{ maxWidth: '1300px', margin: '0 auto' }}>
        
        {/* Header Hero */}
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
            <ShoppingBag size={32} />
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            Verified Retail Product Marketplace
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 1.75rem auto' }}>
            Browse authentic products supplied through verified retail Shops. Click <strong>"Inspect Batch Details"</strong> to flip the card and check manufacturing lineage!
          </p>

          {/* Search & Filter Bar */}
          <form onSubmit={handleSearchSubmit} style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.75rem', height: '46px' }}
                placeholder="Search product name or batch code (e.g. POCO-B001)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ minWidth: '240px', flex: '0 1 260px' }}>
              <select
                className="form-select"
                style={{ height: '46px', fontWeight: 600 }}
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
              >
                <option value="">All Retail Shops</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ height: '46px', padding: '0 1.75rem' }}>
              <Search size={16} />
              <span>Search</span>
            </button>
          </form>
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

        {/* Product Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-sub)' }}>
            <p>Loading marketplace catalog...</p>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={selectedShopId ? "No Products in This Shop Inventory" : "No Marketplace Products Found"}
            description={
              selectedShopId
                ? "This retail shop currently has no products in stock. Select another shop or browse 'All Retail Shops'."
                : "Register a Manufacturer to add products, then register a Shop to acquire stock into the marketplace catalog."
            }
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.75rem' }}>
            {items.map((item) => (
              <ProductFlipCard
                key={item._id}
                item={item}
                onBuyClick={openBuyModal}
              />
            ))}
          </div>
        )}

        {/* Purchase Order Modal */}
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title="Confirm Purchase Order"
          maxWidth="460px"
        >
          {selectedItem && (
            <div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                  {selectedItem.productId?.name}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
                  Retailer Shop: <strong style={{ color: 'var(--text-main)' }}>{selectedItem.shopId?.name}</strong>
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#0369A1', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    Batch: {selectedItem.batchNo}
                  </span>
                  <span style={{ color: 'var(--primary-blue)', fontWeight: 800 }}>
                    ${selectedItem.unitPrice} / unit
                  </span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Select Quantity to Purchase *</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max={selectedItem.availableQuantity}
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(e.target.value)}
                />
                <span className="form-helper">
                  Available stock at shop: {selectedItem.availableQuantity} units
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Contact Mobile Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210 or +91 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
                <span className="form-helper">
                  Contact number for order receipts and notifications.
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-color)',
                marginBottom: '1.5rem'
              }}>
                <span style={{ color: 'var(--text-sub)', fontWeight: 600 }}>Total Price:</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ${(buyQuantity || 1) * selectedItem.unitPrice}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSelectedItem(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  disabled={purchasing}
                  className="btn btn-primary"
                >
                  {purchasing ? 'Processing Order...' : `Confirm & Pay $${(buyQuantity || 1) * selectedItem.unitPrice}`}
                </button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </AppLayout>
  );
};

export default CustomerMarketplace;
