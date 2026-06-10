import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'
import logoImg from '../../assets/logo.svg'
import mascotImg from '../../assets/backgrounds/hacker-application/login-mascot.svg'
import { apiUrl } from '../../lib/api'
import { useHackerPortalScale } from '../../lib/useHackerPortalScale'

function ForgotPassword() {
  const navigate = useNavigate()
  const stageRef = useHackerPortalScale()
  const [email, setEmail] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleRecover = async (e) => {
    if (e) e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    setError(null)
    setIsPending(true)
    try {
      const res = await fetch(apiUrl('/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send reset email.')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsPending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRecover()
  }

  return (
    <div className="login" ref={stageRef}>
      <div className="login-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="login-logo" />
        <span className="login-header-text">IGNITION HACKS V7</span>
      </div>

      <img src={mascotImg} alt="" className="login-mascot" />

      <div className="login-stage">
      <div className="login-card">
        <div className="login-card-header">
          <p className="login-card-title">RESET PASSWORD</p>
          <p className="login-card-subtitle">Enter your email to reset your password.</p>
        </div>

        <div className="login-form-body">
          {submitted ? (
            <p className="login-card-subtitle">
              Instructions have been sent to your email to reset your password.
            </p>
          ) : (
            <>
              <div className="login-fields">
                <div className="login-inputs-group">
                  <input
                    type="email"
                    placeholder="Email"
                    className="login-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isPending}
                    autoComplete="email"
                  />
                </div>
                <div className="login-links">
                  <button type="button" className="login-link" onClick={() => navigate('/login')} disabled={isPending}>Back to log in</button>
                </div>
              </div>

              {error && <p className="login-error">{error}</p>}

              <button
                className="login-submit-btn"
                onClick={handleRecover}
                disabled={isPending}
              >
                {isPending ? 'Sending…' : 'Recover password'}
              </button>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}

export default ForgotPassword
