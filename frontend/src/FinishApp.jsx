import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './FinishApp.css'
import logoImg from './assets/logo.svg'
import checkCircleImg from './assets/backgrounds/info-check-circle.svg'

function FinishApp() {
  const navigate = useNavigate()
  const [appId, setAppId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token) return
    fetch('/applications/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => {
        const apps = data.applications || []
        if (apps.length > 0) setAppId(apps[0]._id)
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async () => {
    if (!appId) {
      setError('No application found. Please complete the previous steps first.')
      return
    }
    const token = sessionStorage.getItem('token')
    if (!token) {
      setError('You must be logged in to submit. Please log in and try again.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/applications/${appId}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Something went wrong. Please try again.')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="finishapp">
        <div className="finishapp-header">
          <img src={logoImg} alt="Ignition Hacks Logo" className="finishapp-logo" />
          <span className="finishapp-header-text">IGNITION HACKS V7</span>
        </div>
        <div className="finishapp-card">
          <div className="finishapp-text">
            <div className="finishapp-titles">
              <p className="finishapp-all-done">You&#39;re in!</p>
              <p className="finishapp-title">APPLICATION SUBMITTED</p>
            </div>
            <p className="finishapp-subtitle">Thanks for applying to Ignition Hacks V7. We&#39;ll be in touch soon!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="finishapp">
      {/* Header */}
      <div className="finishapp-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="finishapp-logo" />
        <span className="finishapp-header-text">IGNITION HACKS V7</span>
      </div>

      {/* Card */}
      <div className="finishapp-card">
        <div className="finishapp-text">
          <div className="finishapp-titles">
            <p className="finishapp-all-done">All done!</p>
            <p className="finishapp-title">READY TO SUBMIT?</p>
          </div>
          <p className="finishapp-subtitle">Apply now to join this year&#39;s super fun hackathon!</p>
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