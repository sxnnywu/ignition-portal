import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './ReviewerApplicationDetail.css'
import headerImg from '../assets/backgrounds/header.svg'

function ReviewerApplicationDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [application, setApplication] = useState(null)
  const [existingReview, setExistingReview] = useState(null) // null = no review yet
  const [scores, setScores] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token) { navigate('/login'); return }

    // fetch the application and any existing review in parallel
    Promise.all([
      fetch(`/applications/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json().then((d) => ({ ok: r.ok, data: d }))),
      fetch(`/applications/${id}/review/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json().then((d) => ({ ok: r.ok, data: d }))),
    ])
      .then(([appResult, reviewResult]) => {
        if (!appResult.ok) throw new Error(appResult.data.message || 'Failed to load application.')
        setApplication(appResult.data.application)

        if (reviewResult.ok) {
          // reviewer already has a review — pre-populate scores for editing
          setExistingReview(reviewResult.data.review)
          // Map scores: Mongoose Map serialises as an object
          setScores(Object.fromEntries(
            Object.entries(reviewResult.data.review.scores).map(([k, v]) => [k, String(v)])
          ))
        } else {
          // no review yet — seed empty score inputs from the answer keys
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

    // validate all scores are non-negative numbers
    const parsedScores = {}
    for (const [key, raw] of Object.entries(scores)) {
      const val = Number(raw)
      if (raw === '' || isNaN(val) || val < 0) {
        setError(`Score for "${key}" must be a non-negative number.`)
        return
      }
      parsedScores[key] = val
    }

    const token = sessionStorage.getItem('token')
    setIsSaving(true)
    try {
      const method = existingReview ? 'PUT' : 'POST'
      const res = await fetch(`/applications/${id}/review`, {
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
      setSuccessMsg(existingReview ? 'Review updated!' : 'Review submitted!')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="reviewer-detail">
        <div className="reviewer-detail-content">
          <p className="reviewer-detail-loading">Loading application...</p>
        </div>
      </div>
    )
  }

  const answers = application?.answers || {}

  return (
    <div className="reviewer-detail">
      <div className="reviewer-detail-content">
        <div className="reviewer-detail-header">
          <img src={headerImg} alt="Ignition Hacks" className="reviewer-detail-logo" />
          <button className="reviewer-back-btn" onClick={() => navigate('/reviewer/dashboard')}>
            ← Back to queue
          </button>
        </div>

        <div className="reviewer-detail-body">
          <div className="reviewer-detail-meta">
            <h1 className="reviewer-detail-name">
              {application?.userId?.name || 'Unknown Applicant'}
            </h1>
            <p className="reviewer-detail-email">{application?.userId?.email || '—'}</p>
            <span className="reviewer-detail-status">{application?.status}</span>
          </div>

          {/* answers */}
          <div className="reviewer-detail-section">
            <h2 className="reviewer-detail-section-title">Application Answers</h2>
            {Object.keys(answers).length === 0 ? (
              <p className="reviewer-detail-empty">No answers submitted.</p>
            ) : (
              Object.entries(answers).map(([key, value]) => (
                <div key={key} className="reviewer-answer-row">
                  <div className="reviewer-answer-left">
                    <p className="reviewer-answer-key">{key}</p>
                    <p className="reviewer-answer-value">
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

          {error && <p className="reviewer-detail-error">{error}</p>}
          {successMsg && <p className="reviewer-detail-success">{successMsg}</p>}

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
