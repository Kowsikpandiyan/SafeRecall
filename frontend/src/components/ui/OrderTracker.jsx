import React from 'react';
import { PackageCheck, RefreshCw, Truck, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

const STEPS = [
  { key: 'ORDER PLACED', label: 'Order Placed', desc: 'Order received by shop', icon: PackageCheck },
  { key: 'PROCESSING', label: 'Processing', desc: 'Shop preparing stock', icon: RefreshCw },
  { key: 'SHIPPED', label: 'Shipped', desc: 'Dispatched for delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Delivered to customer', icon: CheckCircle2 }
];

const getStepIndex = (status) => {
  const normalized = status ? status.toUpperCase() : 'ORDER PLACED';
  if (normalized === 'ORDER PLACED') return 0;
  if (normalized === 'PROCESSING') return 1;
  if (normalized === 'SHIPPED') return 2;
  if (normalized === 'DELIVERED' || normalized === 'COMPLETED') return 3;
  return -1;
};

const OrderTracker = ({ status, orderDate }) => {
  const normalizedStatus = status ? status.toUpperCase() : 'ORDER PLACED';
  const isRecalled = normalizedStatus === 'RECALLED';
  const isReturned = normalizedStatus === 'RETURNED';

  if (isRecalled || isReturned) {
    return (
      <div style={{
        padding: '0.85rem 1.1rem',
        borderRadius: '12px',
        backgroundColor: isRecalled ? '#FEF2F2' : '#EFF6FF',
        border: `1px solid ${isRecalled ? '#FCA5A5' : '#BFDBFE'}`,
        color: isRecalled ? '#991B1B' : '#1E40AF',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        fontSize: '0.88rem',
        fontWeight: 600
      }}>
        {isRecalled ? <AlertTriangle size={18} /> : <RotateCcw size={18} />}
        <span>Order Status: <strong>{normalizedStatus}</strong> (Subject to recall return workflow)</span>
      </div>
    );
  }

  const currentIndex = getStepIndex(normalizedStatus);

  return (
    <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        padding: '0.5rem 0'
      }}>
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;

          let circleBg = 'var(--bg-canvas-subtle)';
          let circleColor = 'var(--text-muted)';
          let borderColor = 'var(--border-color)';

          if (isCompleted) {
            circleBg = '#10B981';
            circleColor = '#FFFFFF';
            borderColor = '#10B981';
          } else if (isCurrent) {
            circleBg = '#2563EB';
            circleColor = '#FFFFFF';
            borderColor = '#2563EB';
          }

          return (
            <div key={step.key} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2
            }}>
              {/* Connector Bar behind icon */}
              {idx > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '-50%',
                  right: '50%',
                  height: '3px',
                  backgroundColor: idx <= currentIndex ? '#10B981' : 'var(--border-color)',
                  zIndex: -1,
                  transition: 'background-color 0.3s ease'
                }} />
              )}

              {/* Step Circle Icon */}
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: circleBg,
                color: circleColor,
                border: `2px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.2)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                <StepIcon size={16} />
              </div>

              {/* Step Label */}
              <div style={{ textAlign: 'center', marginTop: '0.4rem' }}>
                <span style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: isCurrent || isCompleted ? 700 : 500,
                  color: isCurrent ? '#1D4ED8' : isCompleted ? '#047857' : 'var(--text-muted)'
                }}>
                  {step.label}
                </span>
                <span style={{
                  display: 'block',
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.1rem'
                }}>
                  {isCurrent ? 'Current' : isCompleted ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTracker;
