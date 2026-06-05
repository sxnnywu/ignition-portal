import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './FinishApp.css'
import logoImg from '../../assets/logo.svg'
import checkCircleImg from '../../assets/backgrounds/info-check-circle.svg'
import UserIdBadge from '../../components/hacker/UserIdBadge'
import { getToken } from '../../lib/auth'
import { apiUrl } from '../../lib/api'
import { useApplicationDraft } from '../../lib/applicationDraftContext'

function FinishApp() {
  const navigate = useNavigate()
  const { saveDraft, status, setStatus } = useApplicationDraft()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      // make sure the latest draft is saved (and the application exists) first
      const id = await saveDraft()
      if (!id) {
        throw new Error('No application found. Please complete the previous steps first.')
      }
      const token = getToken()
      const res = await fetch(apiUrl(`/applications/${id}/submit`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Something went wrong. Please try again.')
      }
      setStatus('submitted')
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // treat an already-submitted application as done
  if (submitted || status !== 'draft') {
    return (
      <div className="finishapp">
        <UserIdBadge />
        <div className="finishapp-header">
          <img src={logoImg} alt="Ignition Hacks Logo" className="finishapp-logo" />
          <span className="finishapp-header-text">IGNITION HACKS V7</span>
        </div>
        <div className="finishapp-card">
          <div className="finishapp-text">
            <div className="finishapp-titles">
              <p className="finishapp-all-done">You're in!</p>
              <p className="finishapp-title">APPLICATION SUBMITTED</p>
            </div>
            <p className="finishapp-subtitle">Thanks for applying to Ignition Hacks V7. We'll be in touch soon!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="finishapp">
      <UserIdBadge />
      <div className="finishapp-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="finishapp-logo" />
        <span className="finishapp-header-text">IGNITION HACKS V7</span>
      </div>

      <div className="finishapp-card">
        <div className="finishapp-text">
          <div className="finishapp-titles">
            <p className="finishapp-all-done">All done!</p>
            <p className="finishapp-title">READY TO SUBMIT?</p>
          </div>
          <p className="finishapp-subtitle">Apply now to join this year's super fun hackathon!</p>
        </div>

        {error && <p className="finishapp-error">{error}</p>}

        <div className="finishapp-btn-row">
          <button className="finishapp-outline-btn" onClick={() => navigate('/questions')}>Back</button>
          <button
            className="finishapp-filled-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            Submit Application
            <img src={checkCircleImg} alt="" className="finishapp-check-icon" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default FinishApp
