import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './ForgotPassword.css'
import resetBg from './assets/backgrounds/reset.png'
import backBtn from './assets/buttons/login-back-button.png'
import recoverBtn from './assets/buttons/recover-button.png'
import { apiUrl } from './lib/api'

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

  const handleBack = () => {
    navigate('/login')
  }

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to reset password')
        return
      }

      setPassword('')
      setConfirmPassword('')
      setIsSubmitted(true)

      // Redirect to login after 2 seconds
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
    <div className="forgot-password">
      <div className="forgot-password-content">
        <img src={resetBg} alt="" className="forgot-password-bg" />

        <button className="forgot-password-back-button" onClick={handleBack}>
          <img src={backBtn} alt="Back" />
        </button>

        <div className="forgot-password-form">
          {!isSubmitted && !token ? (
            <div className="forgot-password-error">
              <p className="forgot-password-error-message">
                Invalid or expired reset link. Please request a new one.
              </p>
            </div>
          ) : isSubmitted ? (
            <div className="forgot-password-success">
              <p className="forgot-password-success-message">
                Password reset successful! Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset}>
              <div className="forgot-password-form-section">
                <input
                  type="password"
                  placeholder="New Password"
                  className="forgot-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="forgot-password-form-section">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="forgot-password-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <button 
                type="submit"
                className="forgot-password-button" 
                disabled={isLoading}
              >
                <img src={recoverBtn} alt="Reset password" />
              </button>
            </form>
          )}

          {error && (
            <div className="forgot-password-error">
              <p className="forgot-password-error-message">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
