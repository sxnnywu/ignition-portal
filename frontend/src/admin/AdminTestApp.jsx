import { Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AvatarInitials from './components/AvatarInitials';
import headerLogo from '../assets/backgrounds/admin-title.svg';
import TestAllApplications from './pages/TestAllApplications';
import TestUserManagement from './pages/TestUserManagement';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminApp.css';

const MOCK_STATS = {
  statusCounts: {
    accepted: 75,
    waitlisted: 22,
    rejected: 15,
    under_review: 30,
    submitted: 30,
  },
  reviewerCoverage: {
    full: 75,
    partial: 22,
    none: 15,
  },
  totalApplications: 172,
};

function TestNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminActive = location.pathname.startsWith('/admin-test');

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-left">
        <img src={headerLogo} alt="Ignition Hacks V7" className="admin-navbar-logo" />
      </div>
      <div className="admin-navbar-right">
        <button className="admin-navbar-portal-btn" onClick={() => navigate('/admin-test')}>
          Reviewer Portal
        </button>
        <button
          className={`admin-navbar-portal-btn ${isAdminActive ? 'admin-navbar-portal-btn--active' : ''}`}
          onClick={() => navigate('/admin-test')}
        >
          Admin Portal
        </button>
        <div className="admin-navbar-user">
          <AvatarInitials name="Test Admin" size={36} />
          <span className="admin-navbar-username">Test</span>
        </div>
      </div>
    </nav>
  );
}

export default function AdminTestApp() {
  return (
    <div className="admin-app">
      <TestNavbar />
      <div className="admin-body">
        <AdminSidebar stats={MOCK_STATS} basePath="/admin-test" />
        <main className="admin-main">
          <Routes>
            <Route index element={<TestAllApplications />} />
            <Route path="users" element={<TestUserManagement />} />
            <Route path="*" element={<Navigate to="/admin-test" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
