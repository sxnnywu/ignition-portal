import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getToken, clearAuth } from '../../lib/auth'
import { apiUrl } from '../../lib/api'
import { invalidateCache, CACHE_KEYS } from '../../lib/cache'
import './ReviewerApplicationDetail.css'

/* ------------------------------------------------------------------ */
/*  Fixed scoring rubric categories (each 0-25, total 100)            */
/* ------------------------------------------------------------------ */
const SCORING_CATEGORIES = [
  { key: 'technicalSkills', label: 'Technical Skills' },
  { key: 'communicationSkills', label: 'Communication Skills' },
  { key: 'projectManagement', label: 'Project Management' },
  { key: 'problemSolving', label: 'Problem Solving' },
]
const MAX_PER_CATEGORY = 25

/* ------------------------------------------------------------------ */
/*  Application field mappings (grouped into card sections)            */
/* ------------------------------------------------------------------ */
const PERSONAL_FIELDS = [
  { key: 'gender', label: 'Gender' },
  { key: 'age', label: 'Age' },
  { key: 'ethnicity', label: 'Ethnicity' },
  { key: 'country', label: 'Country' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State / Province' },
]

const EDUCATION_FIELDS = [
  { key: 'institution', label: 'School' },
  { key: 'level', label: 'Level of Study' },
  { key: 'program', label: 'Program' },
  { key: 'coop', label: 'Co-op Student' },
]

const EXPERIENCE_FIELDS = [
  { key: 'attended2025', label: 'Attended IgnitionHacks 2025' },
  { key: 'hackathonsAttended', label: 'Hackathons Attended' },
]

const RESPONSE_FIELDS = [
  { key: 'admireDescribe', label: 'How do you think the person you admire the most would describe you?' },
  { key: 'proudProject', label: "What project or build are you most proud of?" },
  { key: 'motivation', label: 'What motivates you to participate in hackathons?' },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function formatAppId(id) {
  if (!id) return '--'
  return `#${id.slice(-6).toUpperCase()}`
}

function displayValue(val) {
  if (val === undefined || val === null || val === '') return '--'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

/** Two-column grid of label/value pairs */
function FieldGrid({ fields, answers }) {
  const pairs = fields
    .map((f) => ({ label: f.label, value: answers[f.key] }))
    .filter((p) => p.value !== undefined && p.value !== null && p.value !== '')

  if (pairs.length === 0) return null

  return (
    <div className="rev-field-grid">
      {pairs.map(({ label, value }) => (
        <div key={label} className="rev-field">
          <span className="rev-field-label">{label}</span>
          <span className="rev-field-value">{displayValue(value)}</span>
        </div>
      ))}
    </div>
  )
}

/** Experience fields -- short values inline, long values in a highlight box */
function ExperienceFields({ fields, answers }) {
  const items = fields
    .map((f) => ({ label: f.label, value: answers[f.key] }))
    .filter((p) => p.value !== undefined && p.value !== null && p.value !== '')

  if (items.length === 0) return <p className="rev-card-empty">No data submitted.</p>

  return items.map(({ label, value }) => {
    const str = displayValue(value)
    const isLong = str.length > 120
    return (
      <div key={label} className="rev-exp-field">
        <span className="rev-field-label">{label}</span>
        {isLong ? (
          <div className="rev-longtext-box">{str}</div>
        ) : (
          <span className="rev-field-value">{str}</span>
        )}
      </div>
    )
  })
}

/** Range slider for a scoring category */
function ScoreSlider({ label, value, onChange }) {
  const pct = (value / MAX_PER_CATEGORY) * 100
  return (
    <div className="rev-slider-group">
      <div className="rev-slider-header">
        <span className="rev-slider-label">{label}</span>
        <span className="rev-slider-value">
          {value}<span className="rev-slider-max">/{MAX_PER_CATEGORY}</span>
        </span>
      </div>
      <div className="rev-slider-track-wrap">
        <input
          type="range"
          min="0"
          max={MAX_PER_CATEGORY}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="rev-slider"
          style={{ '--pct': `${pct}%` }}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */
export default function ReviewerApplicationDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [application, setApplication] = useState(null)
  const [existingReview, setExistingReview] = useState(null)
  const [scores, setScores] = useState(() =>
    Object.fromEntries(SCORING_CATEGORIES.map((c) => [c.key, 0]))
  )
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  /* ---- fetch application + existing review ---- */
  useEffect(() => {
    const token = getToken()
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(apiUrl(`/applications/${id}`), { headers }).then((r) =>
        r.json().then((d) => ({ ok: r.ok, status: r.status, data: d }))
      ),
      fetch(apiUrl(`/applications/${id}/review/me`), { headers })
        .then((r) => r.json().then((d) => ({ ok: r.ok, status: r.status, data: d })))
        .catch(() => ({ ok: false, status: 404, data: {} })),
    ])
      .then(([appRes, revRes]) => {
        if (appRes.status === 401) {
          clearAuth()
          navigate('/login', { replace: true })
          return
        }
        if (!appRes.ok) throw new Error(appRes.data.message || 'Failed to load application.')
        setApplication(appRes.data.application)

        if (revRes.ok && revRes.data.review) {
          const review = revRes.data.review
          setExistingReview(review)
          const loaded = {}
          for (const cat of SCORING_CATEGORIES) {
            loaded[cat.key] = review.scores?.[cat.key] ?? 0
          }
          setScores(loaded)
          setComment(review.comment || '')
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [id, navigate])

  /* ---- derived ---- */
  const totalScore = useMemo(
    () => Object.values(scores).reduce((s, v) => s + (Number(v) || 0), 0),
    [scores]
  )

  /* ---- handlers ---- */
  const handleScoreChange = (key, value) => {
    setScores((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    setError(null)
    setSuccessMsg(null)
    setIsSaving(true)

    const token = getToken()
    try {
      const method = existingReview ? 'PUT' : 'POST'
      const res = await fetch(apiUrl(`/applications/${id}/review`), {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scores, comment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to save review.')
      setExistingReview(data.review)
      invalidateCache(CACHE_KEYS.REVIEWER_APPS)
      setSuccessMsg(existingReview ? 'Review updated!' : 'Review submitted!')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const goBack = () => navigate('/reviewer')

  /* ---- loading state ---- */
  if (isLoading) {
    return (
      <div className="rev-detail">
        <div className="rev-detail-loading">Loading application...</div>
      </div>
    )
  }

  const personal = application?.personal || {}
  const education = application?.education || {}
  const experience = application?.experience || {}
  const teammates = application?.teammates || []
  const responses = application?.responses || {}
  const name = application?.userId?.name || 'Unknown Applicant'
  const email = application?.userId?.email || '--'

  return (
    <div className="rev-detail">
      {/* ============ LEFT: Application content ============ */}
      <div className="rev-detail-content">
        <div className="rev-detail-topbar">
          <button className="rev-detail-back" onClick={goBack}>
            &larr; Return to Pool
          </button>
          <h1 className="rev-detail-heading">
            Application {formatAppId(application?._id)} -- {name}
          </h1>
        </div>

        {/* Personal Information */}
        <div className="rev-card">
          <h2 className="rev-card-title">Personal Information</h2>
          <div className="rev-card-divider" />
          <div className="rev-field-grid">
            <div className="rev-field">
              <span className="rev-field-label">Name</span>
              <span className="rev-field-value">{name}</span>
            </div>
            <div className="rev-field">
              <span className="rev-field-label">Email</span>
              <span className="rev-field-value">{email}</span>
            </div>
          </div>
          <FieldGrid fields={PERSONAL_FIELDS} answers={personal} />
        </div>

        {/* Education */}
        <div className="rev-card">
          <h2 className="rev-card-title">Education</h2>
          <div className="rev-card-divider" />
          <FieldGrid fields={EDUCATION_FIELDS} answers={education} />
          {EDUCATION_FIELDS.every((f) => !education[f.key]) && (
            <p className="rev-card-empty">No data submitted.</p>
          )}
        </div>

        {/* Hackathon Experience */}
        <div className="rev-card">
          <h2 className="rev-card-title">Hackathon Experience</h2>
          <div className="rev-card-divider" />
          <ExperienceFields fields={EXPERIENCE_FIELDS} answers={experience} />
        </div>

        {/* Teammates */}
        <div className="rev-card">
          <h2 className="rev-card-title">Teammates</h2>
          <div className="rev-card-divider" />
          {teammates.length === 0 ? (
            <p className="rev-card-empty">No teammates added.</p>
          ) : (
            <div className="rev-field-grid">
              {teammates.map((t, i) => (
                <div key={t.userId || i} className="rev-field">
                  <span className="rev-field-label">{t.name}</span>
                  <span className="rev-field-value">{t.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Written Responses */}
        <div className="rev-card">
          <h2 className="rev-card-title">Written Responses</h2>
          <div className="rev-card-divider" />
          {RESPONSE_FIELDS.every((f) => !responses[f.key]) ? (
            <p className="rev-card-empty">No responses submitted.</p>
          ) : (
            RESPONSE_FIELDS.map((f) => (
              <div key={f.key} className="rev-exp-field">
                <span className="rev-field-label">{f.label}</span>
                <div className="rev-longtext-box">{responses[f.key] || '--'}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ============ RIGHT: Scoring Rubric ============ */}
      <aside className="rev-rubric">
        <h2 className="rev-rubric-title">Scoring Rubric</h2>

        <div className="rev-rubric-total">
          <span className="rev-rubric-total-label">Total Score</span>
          <span className="rev-rubric-total-number">{totalScore}</span>
          <span className="rev-rubric-total-max">/ 100</span>
        </div>

        <div className="rev-rubric-sliders">
          {SCORING_CATEGORIES.map((cat) => (
            <ScoreSlider
              key={cat.key}
              label={cat.label}
              value={scores[cat.key]}
              onChange={(v) => handleScoreChange(cat.key, v)}
            />
          ))}
        </div>

        <div className="rev-rubric-comment">
          <label className="rev-rubric-comment-label">Comments</label>
          <textarea
            className="rev-rubric-textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your comments here..."
            rows={4}
          />
        </div>

        {error && <p className="rev-rubric-error">{error}</p>}
        {successMsg && <p className="rev-rubric-success">{successMsg}</p>}

        <button
          className={`rev-rubric-btn${existingReview ? ' rev-rubric-btn--secondary' : ''}`}
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : existingReview ? 'Update Existing Review' : 'Save Review'}
        </button>

        <button className="rev-rubric-return" onClick={goBack}>
          &larr; Return to Pool
        </button>
      </aside>
    </div>
  )
}
