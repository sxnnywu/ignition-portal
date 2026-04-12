import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ForgotPassword.css'
import resetBg from './assets/backgrounds/reset.png'
import backBtn from './assets/buttons/login-back-button.png'
import recoverBtn from './assets/buttons/recover-button.png'

function ForgotPassword() {
  const navigate = useNavigate()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleBack = () => {
    navigate('/login')
  }

  const handleRecover = () => {
    setIsSubmitted(true)
  }

  return (
    <div className="forgot-password">
      <div className="forgot-password-content">
        <img src={resetBg} alt="" className="forgot-password-bg" />

        <button className="forgot-password-back-button" onClick={handleBack}>
          <img src={backBtn} alt="Back" />
        </button>

        <div className="forgot-password-form">
          <div className="forgot-password-form-section">
            <input
              type="email"
              placeholder="Email"
              className="forgot-password-input"
            />
          </div>

          <button className="forgot-password-button" onClick={handleRecover}>
            <img src={recoverBtn} alt="Recover password" />
          </button>

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
