import { useNavigate } from 'react-router-dom'
import { getUser } from '../lib/auth'
import './NotFound.css'

export default function NotFound() {
  const navigate = useNavigate()
  const user = getUser()
  const role = user?.role

  const handleGoHome = () => {
    if (role === 'reviewer' || role === 'admin') {
      navigate('/reviewer', { replace: true })
    } else if (role === 'applicant') {
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <span className="notfound-code">404</span>
        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-message">
          The page you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <button className="notfound-btn" onClick={handleGoHome}>
          Go Home
        </button>
      </div>
    </div>
  )
}
