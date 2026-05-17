import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './ForgotPassword.css'
import resetBg from '../../assets/backgrounds/reset.png'
import backBtn from '../../assets/buttons/login-back-button.png'
import recoverBtn from '../../assets/buttons/recover-button.png'
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
    e.preventDefault()
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

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to reset password')
        return
      }

      setPassword('')
      setConfirmPassword('')
      setIsSubmitted(true)

      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError('Error resetting password. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-forgot">
      <div className="auth-forgot-content">
        <img src={resetBg} alt="" className="auth-forgot-bg" />

        <button className="auth-forgot-back-button" onClick={() => navigate('/login')}>
          <img src={backBtn} alt="Back" />
        </button>

        <div className="auth-forgot-form">
          {!isSubmitted && !token ? (
            <div className="auth-forgot-error">
              <p className="auth-forgot-error-message">
                Invalid or expired reset link. Please request a new one.
              </p>
            </div>
          ) : isSubmitted ? (
            <div className="auth-forgot-success">
              <p className="auth-forgot-success-message">
                Password reset successful! Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset}>
              <div className="auth-forgot-form-section">
                <input
                  type="password"
                  placeholder="New Password"
                  className="auth-forgot-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="auth-forgot-form-section">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="auth-forgot-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className="auth-forgot-button"
                disabled={isLoading}
              >
                <img src={recoverBtn} alt="Reset password" />
              </button>
            </form>
          )}

          {error && (
            <div className="auth-forgot-error">
              <p className="auth-forgot-error-message">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
