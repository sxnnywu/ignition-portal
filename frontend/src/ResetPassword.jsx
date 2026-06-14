import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './ResetPassword.css'
import logoImg from './assets/logo.svg'
import iggyImg from './assets/backgrounds/landing-iggy.svg'

function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleReset = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Please fill in both fields.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setError(null)
    setIsPending(true)
    try {
      const res = await fetch('/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="resetpw">
      {/* Header */}
      <div className="resetpw-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="resetpw-logo" />
        <span className="resetpw-header-text">IGNITION HACKS V7</span>
      </div>

      {/* Iggy */}
      <img src={iggyImg} alt="" className="resetpw-iggy" />

      {/* Card */}
      <div className="resetpw-card">
        {/* Top: Back button + title */}
        <div className="resetpw-top">
          <button className="resetpw-back-btn" onClick={() => navigate('/login')}>Back</button>
          <div className="resetpw-title-group">
            <p className="resetpw-title">Set a new password</p>
            <p className="resetpw-subtitle">Enter and confirm your new password below</p>
          </div>
        </div>

        {/* Form */}
        <div className="resetpw-form">
          {submitted ? (
            <>
              <p className="resetpw-success">Your password has been reset successfully.</p>
              <button className="resetpw-submit-btn" onClick={() => navigate('/login')}>
                Back to login
              </button>
            </>
          ) : (
            <>
              <input
                type="password"
                placeholder="New password"
                className="resetpw-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReset()}
              />
              <input
                type="password"
                placeholder="Confirm password"
                className="resetpw-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReset()}
              />
              {error && <p className="resetpw-error">{error}</p>}
              <button
                className="resetpw-submit-btn"
                onClick={handleReset}
                disabled={isPending}
              >
                Reset password
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
