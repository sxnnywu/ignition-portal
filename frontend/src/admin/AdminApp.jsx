import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { fetchStats } from './api/adminApi';
import PortalSidebar from '../components/portal/PortalSidebar';
import { ApplicationsIcon, UsersIcon } from '../components/shared/Icons';
import AllApplications from './pages/AllApplications';
import UserManagement from './pages/UserManagement';
import useCachedFetch from '../hooks/useCachedFetch';
import { CACHE_KEYS, invalidateCache } from '../lib/cache';
import './AdminApp.css';

const STATUS_COLORS = {
  accepted: '#A9FF94',
  waitlisted: '#FFB44A',
  rejected: '#FF8B8B',
  under_review: '#A172FF',
  submitted: '#AEFFFF',
};

const COVERAGE_COLORS = {
  full: '#A9FF94',
  partial: '#FFB44A',
  none: '#FF8B8B',
};

export default function AdminApp() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: stats, refresh: refreshStats } = useCachedFetch(
    CACHE_KEYS.ADMIN_STATS,
    fetchStats,
  );

  const handleDataChange = () => {
    invalidateCache(CACHE_KEYS.ADMIN_STATS);
    refreshStats();
  };

  const isUsers = location.pathname.includes('/users');
  const activeKey = isUsers ? 'users' : 'apps';

  const totalApps = stats?.totalApplications || 0;
  const statusCounts = stats?.statusCounts || {};
  const coverage = stats?.reviewerCoverage || {};

  const sidebarItems = [
    { key: 'apps', label: 'All Applications', icon: <ApplicationsIcon size={18} color="#FFF5EB" />, count: totalApps || undefined },
    { key: 'users', label: 'User Management', icon: <UsersIcon size={18} color="#FFF5EB" /> },
  ];

  const handleSidebarSelect = (key) => {
    if (key === 'users') navigate('/admin/users');
    else navigate('/admin');
  };

  return (
    <div className="admin-app">
      <PortalSidebar
        title="Admin Panel"
        items={sidebarItems}
        activeKey={activeKey}
        onSelect={handleSidebarSelect}
      >
        <div className="admin-stats-group">
          <div className="admin-stats-group-title">Status Breakdown</div>
          <div className="admin-stats-box">
            {[
              { key: 'accepted', label: 'Accepted' },
              { key: 'waitlisted', label: 'Waitlist' },
              { key: 'rejected', label: 'Rejected' },
              { key: 'under_review', label: 'Reviewed' },
              { key: 'submitted', label: 'Pending' },
            ].map(item => (
              <div key={item.key} className="admin-stats-row">
                <span className="admin-stats-label">{item.label}</span>
                <span className="admin-stats-count" style={{ color: STATUS_COLORS[item.key] }}>
                  {statusCounts[item.key] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-stats-group">
          <div className="admin-stats-group-title">Reviewer Coverage</div>
          <div className="admin-stats-box">
            {[
              { key: 'full', label: 'Fully Reviewed' },
              { key: 'partial', label: 'Partial Review' },
              { key: 'none', label: 'No Review' },
            ].map(item => (
              <div key={item.key} className="admin-stats-row">
                <span className="admin-stats-label">{item.label}</span>
                <span className="admin-stats-count" style={{ color: COVERAGE_COLORS[item.key] }}>
                  {coverage[item.key] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </PortalSidebar>

      <main className="admin-main">
        <Routes>
          <Route index element={<AllApplications onDataChange={handleDataChange} />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
