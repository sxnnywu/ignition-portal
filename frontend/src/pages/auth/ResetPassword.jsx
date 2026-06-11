import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './Login.css'
import logoImg from '../../assets/logo.svg'
import mascotImg from '../../assets/backgrounds/hacker-application/login-mascot.svg'
import { apiUrl } from '../../lib/api'

function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [token])

  const handleReset = async (e) => {
    if (e) e.preventDefault()
    setError('')

    if (!password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(apiUrl('/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.message || 'Failed to reset password.')
        return
      }
      setPassword('')
      setConfirmPassword('')
      setIsSubmitted(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      console.error(err)
      setError('Error resetting password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleReset()
  }

  return (
    <div className="login">
      <div className="login-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="login-logo" />
        <span className="login-header-text">IGNITION HACKS V7</span>
      </div>

      <img src={mascotImg} alt="" className="login-mascot" />

      <div className="login-stage">
      <div className="login-card">
        <div className="login-card-header">
          <p className="login-card-title">RESET PASSWORD</p>
          <p className="login-card-subtitle">Choose a new password for your account.</p>
        </div>

        <div className="login-form-body">
          {isSubmitted ? (
            <p className="login-card-subtitle">Password reset successful! Redirecting to login…</p>
          ) : (
            <>
              <div className="login-fields">
                <div className="login-inputs-group">
                  <input
                    type="password"
                    placeholder="New password"
                    className="login-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading || !token}
                    autoComplete="new-password"
                  />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    className="login-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading || !token}
                    autoComplete="new-password"
                  />
                </div>
                <div className="login-links">
                  <button type="button" className="login-link" onClick={() => navigate('/login')} disabled={isLoading}>Back to log in</button>
                </div>
              </div>

              {error && <p className="login-error">{error}</p>}

              <button
                className="login-submit-btn"
                onClick={handleReset}
                disabled={isLoading || !token}
              >
                {isLoading ? 'Resetting…' : 'Reset Password'}
              </button>
            </>
          )}

          {isSubmitted && error && <p className="login-error">{error}</p>}
        </div>
      </div>
      </div>
    </div>
  )
}

export default ResetPassword
