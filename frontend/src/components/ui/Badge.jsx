import React from 'react';

const Badge = ({ variant = 'neutral', children, icon: Icon, className = '', style = {} }) => {
  let badgeClass = 'badge badge-neutral';

  switch (variant) {
    case 'manager':
      badgeClass = 'badge badge-manager';
      break;
    case 'shop':
      badgeClass = 'badge badge-shop';
      break;
    case 'customer':
      badgeClass = 'badge badge-customer';
      break;
    case 'success':
    case 'in-stock':
      badgeClass = 'badge badge-success';
      break;
    case 'warning':
    case 'low-stock':
    case 'pending':
      badgeClass = 'badge badge-warning';
      break;
    case 'danger':
    case 'error':
    case 'recalled':
    case 'out-of-stock':
      badgeClass = 'badge badge-danger';
      break;
    case 'info':
      badgeClass = 'badge badge-info';
      break;
    default:
      badgeClass = 'badge badge-neutral';
  }

  return (
    <span className={`${badgeClass} ${className}`} style={style}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
};

export default Badge;
