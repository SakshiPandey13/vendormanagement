import clsx from 'clsx';

// Map status → CSS class suffix that matches index.css badge rules
const statusClass = {
  // Positive
  active:     'badge-active',
  paid:       'badge-paid',
  delivered:  'badge-delivered',
  completed:  'badge-completed',
  in_stock:   'badge-in_stock',
  approved:   'badge-approved',
  accepted:   'badge-accepted',
  // Neutral / in-progress
  pending:    'badge-pending',
  processing: 'badge-processing',
  packed:     'badge-packed',
  dispatched: 'badge-dispatched',
  inactive:   'badge-inactive',
  refunded:   'badge-refunded',
  // Negative
  cancelled:    'badge-cancelled',
  failed:       'badge-failed',
  rejected:     'badge-rejected',
  suspended:    'badge-suspended',
  out_of_stock: 'badge-out_of_stock',
  low_stock:    'badge-low_stock',
};

const Badge = ({ children, status, variant, className = '', dot = false }) => {
  const colorClass = statusClass[status] || statusClass[variant] || 'badge-pending';

  return (
    <span className={clsx('badge', colorClass, className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" style={{ marginRight: 4, flexShrink: 0 }} />}
      {children || status?.replace(/_/g, ' ')}
    </span>
  );
};

export default Badge;
