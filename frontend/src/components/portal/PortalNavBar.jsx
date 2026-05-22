import { useLocation, useNavigate } from 'react-router-dom'
import './PortalNavBar.css'
import IgnitionLogo from '../../assets/icons/ignition-logo.svg'
import AvatarInitials from '../shared/AvatarInitials'
import { getUser } from '../../lib/auth'

export default function PortalNavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getUser()

  const role = user?.role
  const firstName = user?.name?.split(' ')[0] || 'User'

  const isReviewerActive = location.pathname.startsWith('/reviewer')
  const isAdminActive = location.pathname.startsWith('/admin')

  return (
    <nav className="portal-navbar">
      <div className="portal-navbar-left">
        <img src={IgnitionLogo} alt="Ignition Logo" className="portal-navbar-logo" />
        <span className="portal-navbar-brand">IGNITION HACKS V7</span>
      </div>

      <div className="portal-navbar-right">
        <button
          className={`portal-navbar-btn${isReviewerActive ? ' portal-navbar-btn--active' : ''}`}
          onClick={() => navigate('/reviewer')}
        >
          Reviewer Portal
        </button>

        {role === 'admin' && (
          <button
            className={`portal-navbar-btn${isAdminActive ? ' portal-navbar-btn--active' : ''}`}
            onClick={() => navigate('/admin')}
          >
            Admin Portal
          </button>
        )}

        <div className="portal-navbar-user">
          <AvatarInitials name={user?.name || 'U'} size={36} />
          <span className="portal-navbar-username">{firstName}</span>
        </div>
      </div>
    </nav>
  )
}
