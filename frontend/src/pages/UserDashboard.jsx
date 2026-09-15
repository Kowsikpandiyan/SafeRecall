import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { ShoppingBag, Package, ShoppingCart, CheckCircle2, AlertCircle, RefreshCw, Layers, DollarSign, Store } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'my-shop'

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [shopSummary, setShopSummary] = useState({ totalItemsOwned: 0, totalSpend: 0 });
  const [ownedProducts, setOwnedProducts] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loadingShop, setLoadingShop] = useState(true);

  const [buyQtyMap, setBuyQtyMap] = useState({}); // { [productId]: number }
  const [buyingId, setBuyingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch Inventory Products
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await API.get('/products');
      if (res.data.success) {
        setProducts(res.data.products);
        // Pre-fill default quantity to 20 for convenience
        const initialMap = {};
        res.data.products.forEach((p) => {
          initialMap[p._id] = 20; // Default 20 products as requested!
        });
        setBuyQtyMap(initialMap);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch Shop Owned Products
  const fetchShopInventory = async () => {
    try {
      setLoadingShop(true);
      const res = await API.get('/shop/my-inventory');
      if (res.data.success) {
        setShopSummary(res.data.summary);
        setOwnedProducts(res.data.ownedProducts);
        setPurchaseHistory(res.data.purchaseHistory);
      }
    } catch (err) {
      console.error('Fetch shop inventory error:', err);
    } finally {
      setLoadingShop(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchShopInventory();
  }, []);

  // Shop buys products (e.g. buys 20)
  const handleBuy = async (productId, quantityToBuy) => {
    setError('');
    setSuccessMsg('');

    const qty = Number(quantityToBuy);
    if (!qty || qty <= 0) {
      setError('Please select a valid quantity');
      return;
    }

    try {
      setBuyingId(productId);
      const res = await API.post('/shop/buy', {
        productId,
        quantity: qty
      });

      if (res.data.success) {
        setSuccessMsg(`🎉 Success! Shop bought ${qty} unit(s) of product! Inventory updated.`);
        fetchProducts();
        fetchShopInventory();
        setActiveTab('my-shop'); // Switch to owned tab to show 20 products owned!
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Purchase failed');
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1150px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{
        padding: '2rem',
        marginBottom: '2rem',
        borderLeft: '5px solid var(--user-color)',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(18, 24, 38, 0.8) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-user">
                <Store size={14} /> SHOP / USER PORTAL
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Route: /user
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>
              Shop Purchasing & Inventory
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Browse Manager product inventory, buy products (e.g. 20 units), and manage your shop's owned stock.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Header Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #3b82f6' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRODUCTS OWNED BY SHOP</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.3rem' }}>
            {shopSummary.totalItemsOwned} Units
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL SHOP INVESTMENT</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '0.3rem' }}>
            ${shopSummary.totalSpend}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRODUCT INVENTORY CATALOG</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginTop: '0.3rem' }}>
            {products.length} Items Available
          </div>
        </div>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="error-banner animate-fade-in">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            background: activeTab === 'catalog' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            border: activeTab === 'catalog' ? '1px solid #3b82f6' : '1px solid transparent',
            color: activeTab === 'catalog' ? 'white' : 'var(--text-secondary)',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ShoppingBag size={18} />
          <span>Product Inventory Storefront</span>
        </button>

        <button
          onClick={() => setActiveTab('my-shop')}
          style={{
            background: activeTab === 'my-shop' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            border: activeTab === 'my-shop' ? '1px solid #10b981' : '1px solid transparent',
            color: activeTab === 'my-shop' ? 'white' : 'var(--text-secondary)',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Store size={18} />
          <span>My Shop Inventory ({shopSummary.totalItemsOwned} Owned)</span>
        </button>
      </div>

      {/* Tab 1: Product Catalog (Manager Inventory) */}
      {activeTab === 'catalog' && (
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
                Inventory Products Supplied by Manager
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Select quantity (e.g., 20) and click <strong>Buy Products</strong> to purchase for your shop.
              </p>
            </div>
            <button onClick={fetchProducts} className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <RefreshCw size={13} /> Refresh Catalog
            </button>
          </div>

          {loadingProducts ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
              <div className="spinner" style={{ margin: '0 auto 0.75rem auto' }}></div>
              <p>Loading inventory items...</p>
            </div>
          ) : products.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              background: 'rgba(15, 23, 42, 0.4)',
              borderRadius: '12px',
              border: '1px dashed rgba(255, 255, 255, 0.1)'
            }}>
              <Package size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
              <h4 style={{ color: 'white', marginBottom: '0.3rem' }}>No Inventory Products Available</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Log in as Manager to add initial products (e.g. 100 units stock) into the inventory.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {products.map((p) => {
                const qtyToBuy = buyQtyMap[p._id] || 20;
                const isOutOfStock = p.stockQuantity <= 0;

                return (
                  <div key={p._id} className="glass-card" style={{
                    padding: '1.5rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>
                          {p.sku}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: isOutOfStock ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: isOutOfStock ? '#ef4444' : '#10b981'
                        }}>
                          {isOutOfStock ? 'OUT OF STOCK' : `${p.stockQuantity} IN STOCK`}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', marginBottom: '0.3rem' }}>
                        {p.name}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', height: '36px', overflow: 'hidden' }}>
                        {p.description || 'Standard catalog product.'}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>${p.price}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ unit</span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Buy Qty:</label>
                        <input
                          type="number"
                          className="form-input"
                          min="1"
                          max={p.stockQuantity}
                          style={{ width: '80px', padding: '0.4rem 0.5rem', fontSize: '0.85rem' }}
                          value={qtyToBuy}
                          onChange={(e) => setBuyQtyMap({ ...buyQtyMap, [p._id]: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setBuyQtyMap({ ...buyQtyMap, [p._id]: 20 })}
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: 'none',
                            color: 'white',
                            padding: '0.4rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                          title="Preset 20 units"
                        >
                          Buy 20
                        </button>
                      </div>

                      <button
                        onClick={() => handleBuy(p._id, qtyToBuy)}
                        disabled={isOutOfStock || buyingId === p._id}
                        className="btn-primary"
                        style={{
                          background: isOutOfStock ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          boxShadow: isOutOfStock ? 'none' : '0 10px 20px -5px rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        {buyingId === p._id ? (
                          <>
                            <div className="spinner"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={16} />
                            <span>Buy {qtyToBuy} Units (${qtyToBuy * p.price})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Shop Inventory (Owned Products) */}
      {activeTab === 'my-shop' && (
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
                Shop Inventory — Owned Products
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Displays products purchased by your shop from the inventory.
              </p>
            </div>
            <button onClick={fetchShopInventory} className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <RefreshCw size={13} /> Refresh Owned Stock
            </button>
          </div>

          {loadingShop ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
              <div className="spinner" style={{ margin: '0 auto 0.75rem auto' }}></div>
              <p>Loading shop inventory...</p>
            </div>
          ) : ownedProducts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              background: 'rgba(15, 23, 42, 0.4)',
              borderRadius: '12px',
              border: '1px dashed rgba(255, 255, 255, 0.1)'
            }}>
              <Store size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
              <h4 style={{ color: 'white', marginBottom: '0.3rem' }}>Your Shop Currently Owns 0 Products</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Switch to the Product Inventory Storefront tab and click "Buy 20" to acquire products!
              </p>
              <button onClick={() => setActiveTab('catalog')} className="btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
                Go to Storefront Catalog
              </button>
            </div>
          ) : (
            <div>
              {/* Owned Summary Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                {ownedProducts.map((op) => (
                  <div key={op.sku} className="glass-card" style={{
                    padding: '1.5rem',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                        {op.sku}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Unit Price: ${op.unitPrice}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
                      {op.productName}
                    </h4>

                    <div style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '0.75rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SHOP OWNERSHIP</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                          Owns {op.totalQuantityOwned} Units
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL VALUE</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
                          ${op.totalSpent}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Transaction History Log */}
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
                Shop Purchase Transaction History
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Date & Time</th>
                      <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Product</th>
                      <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>SKU</th>
                      <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Quantity Purchased</th>
                      <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseHistory.map((ph) => (
                      <tr key={ph._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                          {new Date(ph.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem', color: 'white', fontWeight: 600 }}>
                          {ph.productName}
                        </td>
                        <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#a7f3d0' }}>
                          {ph.sku}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                          +{ph.quantity} Units
                        </td>
                        <td style={{ padding: '0.75rem', color: 'white', fontWeight: 600 }}>
                          ${ph.totalPrice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
