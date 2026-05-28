import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'
import logoImg from './assets/logo.svg'
import iggyImg from './assets/backgrounds/landing-iggy.svg'

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="login">
      {/* Header */}
      <div className="login-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="login-logo" />
        <span className="login-header-text">IGNITION HACKS V7</span>
      </div>

      {/* Iggy */}
      <img src={iggyImg} alt="" className="login-iggy" />

      {/* Card */}
      <div className="login-card">
        <div className="login-card-header">
          <p className="login-card-title">IGNITION HACKS</p>
          <p className="login-card-subtitle">Join us for Ignition Hacks V7!</p>
        </div>

        <div className="login-form-body">
          <div className="login-fields">
            <div className="login-inputs-group">
              <input
                type="email"
                placeholder="Email"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <input
                type="password"
                placeholder="Password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="login-links">
              <button type="button" className="login-link" onClick={() => navigate('/signup')}>Sign up</button>
              <button type="button" className="login-link" onClick={() => navigate('/forgot-password')}>Forgot password?</button>
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            className="login-submit-btn"
            onClick={handleLogin}
            disabled={isPending}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
