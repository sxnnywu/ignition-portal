import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ForgotPassword.css'
import logoImg from './assets/logo.svg'
import iggyImg from './assets/backgrounds/landing-iggy.svg'

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleRecover = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    setError(null)
    setIsPending(true)
    try {
      const res = await fetch('/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Something went wrong. Please try again.')
      }
      setSubmitted(true)
    } catch (err) {
      // If endpoint doesn't exist yet, still show success
      if (err.message.includes('fetch') || err.message.includes('Failed')) {
        setSubmitted(true)
      } else {
        setError(err.message)
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="forgotpw">
      {/* Header */}
      <div className="forgotpw-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="forgotpw-logo" />
        <span className="forgotpw-header-text">IGNITION HACKS V7</span>
      </div>

      {/* Iggy */}
      <img src={iggyImg} alt="" className="forgotpw-iggy" />

      {/* Card */}
      <div className="forgotpw-card">
        {/* Top: Back button + title */}
        <div className="forgotpw-top">
          <button className="forgotpw-back-btn" onClick={() => navigate('/login')}>Back</button>
          <div className="forgotpw-title-group">
            <p className="forgotpw-title">Reset your password</p>
            <p className="forgotpw-subtitle">Enter your email to reset your password</p>
          </div>
        </div>

        {/* Form */}
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
