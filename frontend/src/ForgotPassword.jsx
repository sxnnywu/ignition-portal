import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ForgotPassword.css'
import resetBg from './assets/backgrounds/reset.png'
import backBtn from './assets/buttons/login-back-button.png'
import recoverBtn from './assets/buttons/recover-button.png'
import { apiUrl } from './lib/api'

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleBack = () => {
    navigate('/login')
  }

  const handleRecover = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(apiUrl('/forgot-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    <div className="forgot-password">
      <div className="forgot-password-content">
        <img src={resetBg} alt="" className="forgot-password-bg" />

        <button className="forgot-password-back-button" onClick={handleBack}>
          <img src={backBtn} alt="Back" />
        </button>

        <div className="forgot-password-form">
          <form onSubmit={handleRecover}>
            <div className="forgot-password-form-section">
              <input
                type="email"
                placeholder="Email"
                className="forgot-password-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit"
              className="forgot-password-button" 
              disabled={isLoading}
            >
              <img src={recoverBtn} alt="Recover password" />
            </button>
          </form>

          {error && (
            <div className="forgot-password-error">
              <p className="forgot-password-error-message">{error}</p>
            </div>
          )}

          {isSubmitted && (
            <div className="forgot-password-success">
              <p className="forgot-password-success-message">
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
