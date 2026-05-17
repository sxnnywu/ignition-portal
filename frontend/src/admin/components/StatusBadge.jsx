import './StatusBadge.css';

const STATUS_CONFIG = {
  accepted: { label: 'Accepted', className: 'status-badge--accepted' },
  waitlisted: { label: 'Waitlisted', className: 'status-badge--waitlisted' },
  rejected: { label: 'Rejected', className: 'status-badge--rejected' },
  under_review: { label: 'Reviewed', className: 'status-badge--reviewed' },
  submitted: { label: 'Pending', className: 'status-badge--pending' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, className: 'status-badge--pending' };
  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
}
