import { useNavigate, useLocation } from 'react-router-dom';
import { getUser } from '../../lib/auth.js';
import AvatarInitials from './AvatarInitials';
import headerLogo from '../../assets/backgrounds/admin-title.svg';
import './AdminNavbar.css';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const firstName = user?.name?.split(' ')[0] || 'Admin';

  const isAdminActive = location.pathname.startsWith('/admin');

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-left">
        <img src={headerLogo} alt="Ignition Hacks V7" className="admin-navbar-logo" />
      </div>
      <div className="admin-navbar-right">
        <button
          className="admin-navbar-portal-btn"
          onClick={() => navigate('/reviewer')}
        >
          Reviewer Portal
        </button>
        <button
          className={`admin-navbar-portal-btn ${isAdminActive ? 'admin-navbar-portal-btn--active' : ''}`}
          onClick={() => navigate('/admin')}
        >
          Admin Portal
        </button>
        <div className="admin-navbar-user">
          <AvatarInitials name={user?.name || 'A'} size={36} />
          <span className="admin-navbar-username">{firstName}</span>
        </div>
      </div>
    </nav>
  );
}
