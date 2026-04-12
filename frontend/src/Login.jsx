import { useNavigate } from 'react-router-dom'
import './Login.css'
import loginBg from './assets/backgrounds/login.png'
import loginBtn from './assets/buttons/login-button.png'

function Login() {
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/landing')
  }

  return (
    <div className="login">
      <div className="login-content">
        <img src={loginBg} alt="" className="login-bg" />

        <div className="login-form">
          <div className="login-form-section">
            <input
              type="email"
              placeholder="Email"
              className="login-input"
            />
          </div>

          <div className="login-form-section">
            <input
              type="password"
              placeholder="Password"
              className="login-input"
            />
          </div>

          <div className="login-links">
            <button
              type="button"
              className="login-link"
              onClick={() => navigate('/signup')}
            >
              Sign up
            </button>
            <button
              type="button"
              className="login-link"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot Password?
            </button>
          </div>

          <button className="login-button" onClick={handleLogin}>
            <img src={loginBtn} alt="Log In" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
