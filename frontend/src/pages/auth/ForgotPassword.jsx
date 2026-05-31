import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ForgotPassword.css'
import logoImg from '../../assets/logo.svg'
import iggyImg from '../../assets/backgrounds/landing-iggy.svg'
import { apiUrl } from '../../lib/api'

function ForgotPassword() {
  const navigate = useNavigate()
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
        throw new Error(data.message || 'Failed to send reset email')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="forgotpw">
      <div className="forgotpw-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="forgotpw-logo" />
        <span className="forgotpw-header-text">IGNITION HACKS V7</span>
      </div>

      <img src={iggyImg} alt="" className="forgotpw-iggy" />

      <div className="forgotpw-card">
        <div className="forgotpw-top">
          <button className="forgotpw-back-btn" onClick={() => navigate('/login')}>Back</button>
          <div className="forgotpw-title-group">
            <p className="forgotpw-title">Reset your password</p>
            <p className="forgotpw-subtitle">Enter your email to reset your password</p>
          </div>
        </div>

        <div className="forgotpw-form">
          {submitted ? (
            <p className="forgotpw-success">Instructions have been sent to your email to reset your password.</p>
          ) : (
            <>
              <input
                type="email"
                placeholder="Email"
                className="forgotpw-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRecover()}
                disabled={isPending}
              />
              {error && <p className="forgotpw-error">{error}</p>}
              <button
                className="forgotpw-submit-btn"
                onClick={handleRecover}
                disabled={isPending}
              >
                Recover password
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
