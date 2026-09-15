import React from 'react';
import { PackageX } from 'lucide-react';

const EmptyState = ({
  icon: Icon = PackageX,
  title = 'No Records Found',
  description = 'There are no items matching your criteria at this moment.',
  actionButton = null,
  style = {}
}) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        backgroundColor: 'rgba(17, 24, 39, 0.4)',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--border-color-strong)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      <div style={{
        padding: '1rem',
        borderRadius: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-muted)',
        marginBottom: '1rem'
      }}>
        <Icon size={36} />
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', maxWidth: '420px', margin: '0 auto 1.25rem auto', lineHeight: '1.5' }}>
        {description}
      </p>

      {actionButton && <div>{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
