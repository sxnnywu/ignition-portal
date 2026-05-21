import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './AdminApplicationDetail.css'
import headerImg from '../assets/backgrounds/header.svg'

const STATUS_OPTIONS = ['submitted', 'under_review', 'accepted', 'waitlisted', 'rejected']

const STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  accepted: 'Accepted',
  waitlisted: 'Waitlisted',
  rejected: 'Rejected',
}

function AdminApplicationDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [application, setApplication] = useState(null)
  const [reviews, setReviews] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token) { navigate('/login'); return }

    Promise.all([
      fetch(`/applications/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json().then((d) => ({ ok: r.ok, data: d }))),
      fetch(`/applications/${id}/reviews`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json().then((d) => ({ ok: r.ok, data: d }))),
    ])
      .then(([appResult, reviewsResult]) => {
        if (!appResult.ok) throw new Error(appResult.data.message || 'Failed to load application.')
        setApplication(appResult.data.application)
        setSelectedStatus(appResult.data.application.status)
        // 404 just means no reviews yet — that's fine
        if (reviewsResult.ok) {
          setReviews(reviewsResult.data.reviews)
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [id, navigate])

  const handleStatusChange = async () => {
    if (!selectedStatus || selectedStatus === application?.status) return
    setError(null)
    setSuccessMsg(null)
    const token = sessionStorage.getItem('token')
    setIsSaving(true)
    try {
      const res = await fetch(`/applications/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: selectedStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update status.')
      setApplication(data.application)
      setSuccessMsg(`Status updated to "${STATUS_LABELS[selectedStatus]}".`)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="admin-detail">
        <div className="admin-detail-content">
          <p className="admin-detail-loading">Loading application...</p>
        </div>
      </div>
    )
  }

  const answers = application?.answers || {}

  // compute average total score across reviewers
  const avgScore = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.totalScore, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="admin-detail">
      <div className="admin-detail-content">
        <div className="admin-detail-header">
          <img src={headerImg} alt="Ignition Hacks" className="admin-detail-logo" />
          <button className="admin-back-btn" onClick={() => navigate('/admin/dashboard')}>
            ← Back to applications
          </button>
        </div>

        <div className="admin-detail-body">
          {/* applicant meta */}
          <div className="admin-detail-meta">
            <h1 className="admin-detail-name">{application?.userId?.name || 'Unknown Applicant'}</h1>
            <p className="admin-detail-email">{application?.userId?.email || '—'}</p>
          </div>

          {/* status management */}
          <div className="admin-detail-section admin-status-section">
            <h2 className="admin-detail-section-title">Application Status</h2>
            <div className="admin-status-row">
              <span className={`admin-status-badge admin-status-badge--${application?.status}`}>
                {STATUS_LABELS[application?.status] || application?.status}
              </span>
              <select
                className="admin-status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              <button
                className="admin-status-save-btn"
                onClick={handleStatusChange}
                disabled={isSaving || selectedStatus === application?.status}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
            {error && <p className="admin-detail-error">{error}</p>}
            {successMsg && <p className="admin-detail-success">{successMsg}</p>}
          </div>

          {/* reviewer scores summary */}
          <div className="admin-detail-section">
            <h2 className="admin-detail-section-title">
              Reviewer Scores
              {avgScore !== null && (
                <span className="admin-avg-score">Avg total: {avgScore}</span>
              )}
            </h2>
            {reviews.length === 0 ? (
              <p className="admin-detail-empty">No reviews submitted yet.</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="admin-review-card">
                  <div className="admin-review-card-header">
                    <p className="admin-reviewer-name">{review.reviewerId?.name || 'Unknown reviewer'}</p>
                    <span className="admin-review-total">Total: {review.totalScore}</span>
                  </div>
                  <div className="admin-review-scores">
                    {Object.entries(review.scores).map(([key, val]) => (
                      <div key={key} className="admin-review-score-row">
                        <span className="admin-review-score-key">{key}</span>
                        <span className="admin-review-score-val">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* application answers */}
          <div className="admin-detail-section">
            <h2 className="admin-detail-section-title">Application Answers</h2>
            {Object.keys(answers).length === 0 ? (
              <p className="admin-detail-empty">No answers submitted.</p>
            ) : (
              Object.entries(answers).map(([key, value]) => (
                <div key={key} className="admin-answer-row">
                  <p className="admin-answer-key">{key}</p>
                  <p className="admin-answer-value">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminApplicationDetail
