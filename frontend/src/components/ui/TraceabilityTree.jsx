import React from 'react';
import { Shield, ArrowDown, Store, User, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import Badge from './Badge';

const TraceabilityTree = ({ data }) => {
  if (!data) return null;

  const { manager, product, batchNo, shops, recalls, summary } = data;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Visual Tree Node Container */}
      <div className="card-surface" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Badge variant="info" style={{ marginBottom: '0.5rem' }}>ENTERPRISE SUPPLY CHAIN LINEAGE</Badge>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Batch Lineage Architecture ({batchNo})
          </h3>
        </div>

        {/* NODE 1: MANUFACTURER ORIGIN */}
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #DBEAFE',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          maxWidth: '680px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <Badge variant="manager" icon={Shield}>LAYER 1: MANUFACTURER ORIGIN</Badge>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              NODE_ID: {manager._id?.slice(-8)}
            </span>
          </div>

          <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            {manager.name}
          </h4>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.825rem', color: 'var(--text-sub)', flexWrap: 'wrap' }}>
            <span>Email: <strong style={{ color: 'var(--text-main)' }}>{manager.email}</strong></span>
            <span>Contact: <strong style={{ color: 'var(--text-main)' }}>{manager.phone || 'Verified Supplier'}</strong></span>
          </div>
        </div>

        {/* Connector Line 1 */}
        <div style={{ textAlign: 'center', color: 'var(--primary-blue)', margin: '0.85rem 0' }}>
          <ArrowDown size={26} />
        </div>

        {/* NODE 2: PRODUCT & BATCH REGISTRATION */}
        <div style={{
          backgroundColor: '#F0F9FF',
          border: '1px solid #BAE6FD',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          maxWidth: '680px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Badge variant="info">LAYER 2: PRODUCT BATCH</Badge>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#0369A1',
                backgroundColor: '#E0F2FE',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px'
              }}>
                BATCH: {batchNo}
              </span>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ${product.price} / unit
            </span>
          </div>

          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            {product.name}
          </h4>

          {/* Stock Progress Bar */}
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-sub)' }}>Manufactured Stock Distribution</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>
                {product.availableQuantity} Manager Stock / {product.totalQuantity} Total Units
              </span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.round(((product.totalQuantity - product.availableQuantity) / (product.totalQuantity || 1)) * 100)}%`,
                  backgroundColor: 'var(--primary-blue)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Connector Line 2 */}
        <div style={{ textAlign: 'center', color: 'var(--primary-blue)', margin: '0.85rem 0' }}>
          <ArrowDown size={26} />
        </div>

        {/* NODE 3: SHOPS & DISTRIBUTORS */}
        <div>
          <h4 style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            textAlign: 'center',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <Store size={18} color="var(--success-color)" />
            LAYER 3: SHOP DISTRIBUTOR NODES ({shops.length} SHOPS RECEIVED BATCH)
          </h4>

          {shops.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>
              No retail Shops have acquired stock from this batch yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {shops.map((shop) => (
                <div key={shop.shopName} style={{
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <Badge variant="shop" icon={Store}>{shop.shopName}</Badge>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--success-color)' }}>
                      {shop.totalQuantityReceived} Units Purchased
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '0.75rem' }}>
                    Contact: {shop.shopEmail} | Current Shop Inventory: <strong style={{ color: 'var(--text-main)' }}>{shop.currentShopStock} units</strong>
                  </p>

                  {/* Customer Orders Node under Shop */}
                  <div style={{ borderTop: '1px solid #DCFCE7', paddingTop: '0.75rem' }}>
                    <div style={{
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      LAYER 4: CUSTOMER ORDERS ({shop.customerOrders.length})
                    </div>

                    {shop.customerOrders.length === 0 ? (
                      <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>No customer orders placed at this shop yet.</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {shop.customerOrders.map((ord) => (
                          <div key={ord.orderId} style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid var(--border-color)',
                            padding: '0.6rem 0.8rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <strong style={{ color: 'var(--text-main)', display: 'block' }}>{ord.customerName}</strong>
                              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.725rem' }}>
                                #{ord.orderId}
                              </span>
                            </div>
                            <span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>
                              {ord.quantityPurchased} units (${ord.totalAmount})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NODE 4: RECALL & RETURN PROGRESS PIPELINE */}
        {recalls.length > 0 && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginTop: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <Badge variant="danger" icon={AlertTriangle}>ACTIVE BATCH RECALL TRACKING</Badge>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--danger-color)' }}>
                RECALL STATUS: ACTIVE
              </span>
            </div>

            {recalls.map((r) => (
              <div key={r._id} style={{ marginBottom: '1rem' }}>
                <p style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem' }}>Reason: {r.reason}</p>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', marginTop: '0.2rem' }}>Instructions: {r.message}</p>
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>SUBMITTED RETURN REQUESTS</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D97706', marginTop: '0.2rem' }}>
                  {summary.totalReturnsSubmitted} Requests
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONFIRMED RETURNED TO MANAGER</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success-color)', marginTop: '0.2rem' }}>
                  {summary.totalReturnsCompleted} Completed
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TraceabilityTree;
