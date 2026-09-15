import React, { useState } from 'react';
import { ShoppingCart, Eye, RotateCcw, Store, Package, ShieldCheck } from 'lucide-react';
import Badge from './ui/Badge';

const ProductFlipCard = ({ item, onBuyClick }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const product = item.productId || {};
  const shop = item.shopId || {};

  return (
    <div className={`flip-card-container ${isFlipped ? 'is-flipped' : ''}`}>
      <div className="flip-card-inner">
        
        {/* FRONT OF CARD */}
        <div className="flip-card-front card-surface" style={{ padding: '1.25rem' }}>
          <div>
            <div style={{
              position: 'relative',
              width: '100%',
              height: '160px',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              marginBottom: '1rem',
              backgroundColor: '#EFF6FF',
              border: '1px solid var(--border-color)'
            }}>
              <img
                src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'}
                alt={product.name || 'Product'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                <Badge variant="shop" icon={Store}>{shop.name || 'Shop'}</Badge>
              </div>
            </div>

            <h4 style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginBottom: '0.35rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {product.name || 'Product Item'}
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                ${item.unitPrice || product.price}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: '#0369A1',
                backgroundColor: '#E0F2FE',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 600
              }}>
                {item.batchNo}
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setIsFlipped(true)}
              className="btn btn-outline btn-sm"
              style={{ width: '100%' }}
            >
              <Eye size={15} />
              <span>Inspect Batch Details</span>
            </button>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div className="flip-card-back card-surface" style={{
          padding: '1.25rem',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '0.5rem'
            }}>
              <Badge variant="info" icon={ShieldCheck}>BATCH SPECS</Badge>
              <button
                onClick={() => setIsFlipped(false)}
                className="btn-ghost"
                style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', color: 'var(--text-sub)' }}
              >
                <RotateCcw size={13} />
                <span>Front</span>
              </button>
            </div>

            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.6rem' }}>
              {product.name}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <span style={{ color: 'var(--text-sub)' }}>Price per unit:</span>
                <strong style={{ color: 'var(--text-main)' }}>${item.unitPrice || product.price}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#EFF6FF', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #DBEAFE' }}>
                <span style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>Batch Code:</span>
                <strong style={{ color: '#0369A1', fontFamily: 'var(--font-mono)' }}>{item.batchNo}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <span style={{ color: 'var(--text-sub)' }}>Shop Stock:</span>
                <strong style={{ color: 'var(--success-color)' }}>{item.availableQuantity} available</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <span style={{ color: 'var(--text-sub)' }}>Selling Shop:</span>
                <strong style={{ color: 'var(--text-main)' }}>{shop.name}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => onBuyClick(item)}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            <ShoppingCart size={16} />
            <span>Buy Now</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductFlipCard;
