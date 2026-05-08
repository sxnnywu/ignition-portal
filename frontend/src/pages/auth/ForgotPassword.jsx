import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ForgotPassword.css'
import resetBg from '../../assets/backgrounds/reset.png'
import backBtn from '../../assets/buttons/login-back-button.png'
import recoverBtn from '../../assets/buttons/recover-button.png'
import { apiUrl } from '../../lib/api'

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRecover = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(apiUrl('/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to send reset email')
        return
      }

      setEmail('')
      setIsSubmitted(true)
    } catch (err) {
      setError('Error sending reset email. Please try again.')
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
          <form onSubmit={handleRecover}>
            <div className="auth-forgot-form-section">
              <input
                type="email"
                placeholder="Email"
                className="auth-forgot-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="auth-forgot-button"
              disabled={isLoading}
            >
              <img src={recoverBtn} alt="Recover password" />
            </button>
          </form>

          {error && (
            <div className="auth-forgot-error">
              <p className="auth-forgot-error-message">{error}</p>
            </div>
          )}

          {isSubmitted && (
            <div className="auth-forgot-success">
              <p className="auth-forgot-success-message">
                Instructions have been sent to your email to reset your password.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
