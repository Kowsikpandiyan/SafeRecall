import React from 'react';
import { AlertTriangle, Bell, RotateCcw, Store, ShieldCheck, Check } from 'lucide-react';

const RecallTimeline = ({ currentStatus = 'RECALL_BROADCAST' }) => {
  const steps = [
    { key: 'RECALL_BROADCAST', label: 'Recall Broadcast', icon: AlertTriangle },
    { key: 'NOTIFIED', label: 'Shops & Customers Notified', icon: Bell },
    { key: 'RETURN_REQUESTED', label: 'Return Submitted', icon: RotateCcw },
    { key: 'SHOP_RECEIVED', label: 'Received by Shop', icon: Store },
    { key: 'MANAGER_RECEIVED', label: 'Returned to Manager', icon: ShieldCheck }
  ];

  const getStepStatus = (stepKey, index) => {
    const statusOrder = ['RECALL_BROADCAST', 'NOTIFIED', 'RETURN_REQUESTED', 'SHOP_RECEIVED', 'MANAGER_RECEIVED'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentIndex > index) return 'completed';
    if (currentIndex === index) return 'current';
    return 'pending';
  };

  return (
    <div style={{ padding: '1.25rem 0.5rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        {/* Connecting line */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '5%',
          right: '5%',
          height: '2px',
          backgroundColor: '#E2E8F0',
          zIndex: 1
        }} />

        {steps.map((step, index) => {
          const state = getStepStatus(step.key, index);
          const StepIcon = step.icon;

          let iconBg = '#F8FAFC';
          let iconColor = 'var(--text-muted)';
          let borderColor = '#E2E8F0';

          if (state === 'completed') {
            iconBg = '#F0FDF4';
            iconColor = 'var(--success-color)';
            borderColor = '#BBF7D0';
          } else if (state === 'current') {
            iconBg = '#FEF2F2';
            iconColor = 'var(--danger-color)';
            borderColor = '#FCA5A5';
          }

          return (
            <div key={step.key} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2,
              flex: 1,
              textAlign: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: iconBg,
                border: `2px solid ${borderColor}`,
                color: iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.5rem',
                transition: 'all 0.3s ease'
              }}>
                {state === 'completed' ? <Check size={18} /> : <StepIcon size={18} />}
              </div>

              <span style={{
                fontSize: '0.75rem',
                fontWeight: state === 'current' ? 700 : 600,
                color: state === 'current' ? 'var(--text-main)' : state === 'completed' ? 'var(--text-sub)' : 'var(--text-muted)',
                maxWidth: '100px'
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecallTimeline;
