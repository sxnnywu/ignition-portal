import { useNavigate } from 'react-router-dom'
import './Signup.css'
import signupBg from './assets/backgrounds/signup.png'
import signupBtn from './assets/buttons/signup-button.png'

function Signup() {
  const navigate = useNavigate()

  const handleSignup = () => {
    navigate('/landing')
  }

  return (
    <div className="signup">
      <div className="signup-content">
        <img src={signupBg} alt="" className="signup-bg" />

        <div className="signup-form">
          <div className="signup-form-row">
            <div className="signup-form-section">
              <input
                type="text"
                placeholder="First name"
                className="signup-input"
              />
            </div>

            <div className="signup-form-section">
              <input
                type="text"
                placeholder="Last name"
                className="signup-input"
              />
            </div>
          </div>

          <div className="signup-form-section">
            <input
              type="email"
              placeholder="Email"
              className="signup-input"
            />
          </div>

          <div className="signup-form-section">
            <input
              type="password"
              placeholder="Password"
              className="signup-input"
            />
          </div>

          <div className="signup-links">
            <span className="signup-text">
              Already have an account?{' '}
              <button
                type="button"
                className="signup-link"
                onClick={() => navigate('/login')}
              >
                Log in
              </button>
            </span>
          </div>

          <button className="signup-button" onClick={handleSignup}>
            <img src={signupBtn} alt="Sign up" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Signup
