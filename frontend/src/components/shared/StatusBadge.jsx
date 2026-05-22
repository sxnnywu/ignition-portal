import './StatusBadge.css';

const STATUS_CONFIG = {
  // Admin statuses
  accepted: { label: 'Accepted', className: 'status-badge--accepted' },
  waitlisted: { label: 'Waitlisted', className: 'status-badge--waitlisted' },
  rejected: { label: 'Rejected', className: 'status-badge--rejected' },
  under_review: { label: 'Reviewed', className: 'status-badge--reviewed' },
  submitted: { label: 'Pending', className: 'status-badge--pending' },
  // Reviewer aliases (reviewStatus uses these keys)
  reviewed: { label: 'Reviewed', className: 'status-badge--reviewed' },
  pending: { label: 'Pending', className: 'status-badge--pending' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, className: 'status-badge--pending' };
  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
}
