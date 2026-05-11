import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './ReviewerDashboard.css'
import headerImg from '../assets/backgrounds/header.svg'

const STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  accepted: 'Accepted',
  waitlisted: 'Waitlisted',
  rejected: 'Rejected',
  draft: 'Draft',
}

function ReviewerDashboard() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    fetch('/applications/queue', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || 'Failed to load queue.')
        setApplications(data.applications)
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [navigate])

  const handleLogout = () => {
    sessionStorage.clear()
    navigate('/login')
  }

  return (
    <div className="reviewer-dashboard">
      <div className="reviewer-dashboard-content">
        <div className="reviewer-dashboard-header">
          <img src={headerImg} alt="Ignition Hacks" className="reviewer-dashboard-logo" />
          <button className="reviewer-logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>

        <div className="reviewer-dashboard-body">
          <h1 className="reviewer-dashboard-title">Review Queue</h1>
          <p className="reviewer-dashboard-subtitle">
            {isLoading ? 'Loading...' : `${applications.length} application${applications.length !== 1 ? 's' : ''} to review`}
          </p>

          {error && <p className="reviewer-dashboard-error">{error}</p>}

          {!isLoading && !error && applications.length === 0 && (
            <div className="reviewer-dashboard-empty">
              No applications in the queue right now.
            </div>
          )}

          <div className="reviewer-dashboard-list">
            {applications.map((app) => (
              <button
                key={app._id}
                className="reviewer-app-card"
                onClick={() => navigate(`/reviewer/application/${app._id}`)}
              >
                <div className="reviewer-app-card-left">
                  <p className="reviewer-app-name">{app.userId?.name || 'Unknown'}</p>
                  <p className="reviewer-app-email">{app.userId?.email || '—'}</p>
                </div>
                <div className="reviewer-app-card-right">
                  <span className={`reviewer-app-status reviewer-app-status--${app.status}`}>
                    {STATUS_LABELS[app.status] || app.status}
                  </span>
                  <p className="reviewer-app-date">
                    {app.submittedAt
                      ? new Date(app.submittedAt).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewerDashboard
