import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'
import headerImg from '../assets/backgrounds/header.svg'

const STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  accepted: 'Accepted',
  waitlisted: 'Waitlisted',
  rejected: 'Rejected',
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token) { navigate('/login'); return }

    fetch('/applications', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || 'Failed to load applications.')
        setApplications(data.applications)
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [navigate])

  const handleLogout = () => {
    sessionStorage.clear()
    navigate('/login')
  }

  const filtered = filter === 'all'
    ? applications
    : applications.filter((a) => a.status === filter)

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-content">
        <div className="admin-dashboard-header">
          <img src={headerImg} alt="Ignition Hacks" className="admin-dashboard-logo" />
          <button className="admin-logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>

        <div className="admin-dashboard-body">
          <h1 className="admin-dashboard-title">Applications</h1>
          <p className="admin-dashboard-subtitle">
            {isLoading ? 'Loading...' : `${applications.length} total application${applications.length !== 1 ? 's' : ''}`}
          </p>

          {/* status filter tabs */}
          <div className="admin-filter-tabs">
            {['all', 'submitted', 'under_review', 'accepted', 'waitlisted', 'rejected', 'draft'].map((s) => (
              <button
                key={s}
                className={`admin-filter-tab ${filter === s ? 'admin-filter-tab--active' : ''}`}
                onClick={() => setFilter(s)}
              >
                {s === 'all' ? 'All' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {error && <p className="admin-dashboard-error">{error}</p>}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="admin-dashboard-empty">No applications found.</div>
          )}

          {!isLoading && filtered.length > 0 && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app._id}>
                    <td>{app.userId?.name || '—'}</td>
                    <td>{app.userId?.email || '—'}</td>
                    <td>
                      <span className={`admin-status-badge admin-status-badge--${app.status}`}>
                        {STATUS_LABELS[app.status] || app.status}
                      </span>
                    </td>
                    <td>{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <button
                        className="admin-view-btn"
                        onClick={() => navigate(`/admin/application/${app._id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
