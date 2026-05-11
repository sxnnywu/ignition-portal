import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'
import loginBg from './assets/backgrounds/login.png'
import loginBtn from './assets/buttons/login-button.png'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)

  const handleLogin = async () => {
    setError(null)
    setIsPending(true)
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Please try again.')
      }
      sessionStorage.setItem('token', data.token)
      sessionStorage.setItem('role', data.user.role)
      sessionStorage.setItem('userId', data.user._id)
      if (data.user.role === 'reviewer') navigate('/reviewer/dashboard')
      else if (data.user.role === 'admin') navigate('/admin/dashboard')
      else navigate('/landing')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsPending(false)
    }
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login-form-section">
            <input
              type="password"
              placeholder="Password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="login-error">{error}</p>}

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

          <button className="login-button" onClick={handleLogin} disabled={isPending}>
            <img src={loginBtn} alt="Log In" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
