import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../../admin/pages/AdminApplicationDetail.css'
import './ReviewerApplicationDetail.css'
import { getToken, clearAuth } from '../../lib/auth'
import { apiUrl } from '../../lib/api'
import { invalidateCache, CACHE_KEYS } from '../../lib/cache'

function ReviewerApplicationDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [application, setApplication] = useState(null)
  const [existingReview, setExistingReview] = useState(null)
  const [scores, setScores] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(apiUrl(`/applications/${id}`), { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, status: r.status, data: d }))),
      fetch(apiUrl(`/applications/${id}/review/me`), { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, status: r.status, data: d }))),
    ])
      .then(([appResult, reviewResult]) => {
        if (appResult.status === 401) {
          clearAuth()
          navigate('/login', { replace: true })
          return
        }
        if (!appResult.ok) {
          throw new Error(appResult.data.message || 'Failed to load application.')
        }
        setApplication(appResult.data.application)

        if (reviewResult.ok) {
          setExistingReview(reviewResult.data.review)
          setScores(Object.fromEntries(
            Object.entries(reviewResult.data.review.scores).map(([k, v]) => [k, String(v)])
          ))
        } else {
          const answers = appResult.data.application.answers || {}
          setScores(Object.fromEntries(Object.keys(answers).map((k) => [k, ''])))
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [id, navigate])

  const handleScoreChange = (key, value) => {
    setScores((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    setError(null)
    setSuccessMsg(null)

    const parsedScores = {}
    for (const [key, raw] of Object.entries(scores)) {
      const val = Number(raw)
      if (raw === '' || isNaN(val) || val < 0) {
        setError(`Score for "${key}" must be a non-negative number.`)
        return
      }
      parsedScores[key] = val
    }

    const token = getToken()
    setIsSaving(true)
    try {
      const method = existingReview ? 'PUT' : 'POST'
      const res = await fetch(apiUrl(`/applications/${id}/review`), {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scores: parsedScores }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to save review.')
      setExistingReview(data.review)
      // Stale the reviewer list so it reflects the new review status
      invalidateCache(CACHE_KEYS.REVIEWER_APPS)
      setSuccessMsg(existingReview ? 'Review updated!' : 'Review submitted!')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="app-detail">
        <div className="app-detail-content">
          <p className="app-detail-loading">Loading application...</p>
        </div>
      </div>
    )
  }

  const answers = application?.answers || {}

  return (
    <div className="app-detail">
      <div className="app-detail-content">
        <div className="app-detail-header">
          <button className="app-detail-back-btn" onClick={() => navigate('/reviewer')}>
            &larr; Back to queue
          </button>
        </div>

        <div className="app-detail-body">
          <div className="app-detail-meta">
            <h1 className="app-detail-name">
              {application?.userId?.name || 'Unknown Applicant'}
            </h1>
            <p className="app-detail-email">{application?.userId?.email || '--'}</p>
            <span className="reviewer-detail-status">{application?.status}</span>
          </div>

          <div className="app-detail-section">
            <h2 className="app-detail-section-title">Application Answers</h2>
            {Object.keys(answers).length === 0 ? (
              <p className="app-detail-empty">No answers submitted.</p>
            ) : (
              Object.entries(answers).map(([key, value]) => (
                <div key={key} className="reviewer-answer-row">
                  <div className="reviewer-answer-left">
                    <p className="app-detail-answer-key">{key}</p>
                    <p className="app-detail-answer-value">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </p>
                  </div>
                  <div className="reviewer-answer-right">
                    <label className="reviewer-score-label">Score</label>
                    <input
                      type="number"
                      min="0"
                      className="reviewer-score-input"
                      value={scores[key] ?? ''}
                      onChange={(e) => handleScoreChange(key, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {error && <p className="app-detail-error">{error}</p>}
          {successMsg && <p className="app-detail-success">{successMsg}</p>}

          <div className="reviewer-detail-actions">
            <button
              className="reviewer-submit-btn"
              onClick={handleSubmit}
              disabled={isSaving || Object.keys(answers).length === 0}
            >
              {isSaving ? 'Saving...' : existingReview ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewerApplicationDetail
