import React from 'react';

const StatCard = ({ title, value, subtext, trend, icon: Icon, color = 'primary' }) => {
  const getColorStyles = () => {
    switch (color) {
      case 'success':
        return { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' };
      case 'warning':
        return { bg: '#fef3c7', border: '#fde68a', text: '#d97706' };
      case 'danger':
        return { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' };
      case 'info':
      case 'primary':
      default:
        return { bg: '#eff6ff', border: '#dbeafe', text: '#2563eb' };
    }
  };

  const colors = getColorStyles();

  return (
    <div className="card-surface" style={{ padding: '1.25rem', backgroundColor: '#ffffff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            padding: '0.45rem',
            borderRadius: '10px',
            backgroundColor: colors.bg,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {value}
        </span>
        {trend && (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: trend.startsWith('+') ? '#16a34a' : trend.startsWith('-') ? '#dc2626' : '#64748b',
            background: trend.startsWith('+') ? '#f0fdf4' : '#fef2f2',
            padding: '0.15rem 0.45rem',
            borderRadius: '6px'
          }}>
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 600 }}>
          {subtext}
        </p>
      )}
    </div>
  );
};

export default StatCard;
