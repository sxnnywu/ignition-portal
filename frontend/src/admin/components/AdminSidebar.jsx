import { useLocation, useNavigate } from 'react-router-dom';
import { ApplicationsIcon, UsersIcon } from './Icons';
import './AdminSidebar.css';

const STATUS_DOTS = {
  accepted: '#22c55e',
  waitlisted: '#a855f7',
  rejected: '#ef4444',
  under_review: '#3b82f6',
  submitted: '#f59e0b',
};

const COVERAGE_DOTS = {
  full: '#22c55e',
  partial: '#f59e0b',
  none: '#ef4444',
};

export default function AdminSidebar({ stats, basePath = '/admin' }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isUsers = location.pathname.includes('/users');
  const isApps = !isUsers;

  const statusCounts = stats?.statusCounts || {};
  const coverage = stats?.reviewerCoverage || {};
  const totalApps = stats?.totalApplications || 0;

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">Admin Panel</div>

      <nav className="admin-sidebar-nav">
        <button
          className={`admin-sidebar-link ${isApps ? 'admin-sidebar-link--active' : ''}`}
          onClick={() => navigate(basePath)}
        >
          <ApplicationsIcon size={18} color="#FFF5EB" />
          <span>All Applications</span>
          {totalApps > 0 && <span className="admin-sidebar-badge">{totalApps}</span>}
        </button>
        <button
          className={`admin-sidebar-link ${isUsers ? 'admin-sidebar-link--active' : ''}`}
          onClick={() => navigate(`${basePath}/users`)}
        >
          <UsersIcon size={18} color="#FFF5EB" />
          <span>User Management</span>
        </button>
      </nav>

      <div className="admin-sidebar-section">
        <div className="admin-sidebar-section-title">Status Breakdown</div>
        <div className="admin-sidebar-stats">
          {[
            { key: 'accepted', label: 'Accepted' },
            { key: 'waitlisted', label: 'Waitlist' },
            { key: 'rejected', label: 'Rejected' },
            { key: 'under_review', label: 'Reviewed' },
            { key: 'submitted', label: 'Pending' },
          ].map(item => (
            <div key={item.key} className="admin-sidebar-stat">
              <span className="admin-sidebar-stat-dot" style={{ background: STATUS_DOTS[item.key] }} />
              <span className="admin-sidebar-stat-label">{item.label}</span>
              <span className="admin-sidebar-stat-count">{statusCounts[item.key] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-sidebar-section">
        <div className="admin-sidebar-section-title">Reviewer Coverage</div>
        <div className="admin-sidebar-stats">
          {[
            { key: 'full', label: 'Fully Reviewed' },
            { key: 'partial', label: 'Partial Review' },
            { key: 'none', label: 'No Review' },
          ].map(item => (
            <div key={item.key} className="admin-sidebar-stat">
              <span className="admin-sidebar-stat-dot" style={{ background: COVERAGE_DOTS[item.key] }} />
              <span className="admin-sidebar-stat-label">{item.label}</span>
              <span className="admin-sidebar-stat-count">{coverage[item.key] || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
