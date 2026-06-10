import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'
import logoImg from '../../assets/logo.svg'
import mascotImg from '../../assets/backgrounds/hacker-application/login-mascot.svg'
import { getToken, getUser, setAuth } from '../../lib/auth'
import { apiUrl } from '../../lib/api'
import { useHackerPortalScale } from '../../lib/useHackerPortalScale'

function Login() {
  const navigate = useNavigate()
  const stageRef = useHackerPortalScale()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (getToken()) {
      const user = getUser()
      if (user?.role === 'reviewer' || user?.role === 'admin') {
        navigate('/reviewer', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [navigate])

  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('Email and password are required.')
      return
    }

    setIsPending(true)
    try {
      const res = await fetch(apiUrl('/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Please try again.')
      }
      setAuth(data.token, data.user)
      if (data.user?.role === 'reviewer' || data.user?.role === 'admin') {
        navigate('/reviewer', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
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
    <div className="login" ref={stageRef}>
      <div className="login-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="login-logo" />
        <span className="login-header-text">IGNITION HACKS V7</span>
      </div>

      <img src={mascotImg} alt="" className="login-mascot" />

      <div className="login-stage">
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
                disabled={isPending}
                autoComplete="email"
              />
              <input
                type="password"
                placeholder="Password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isPending}
                autoComplete="current-password"
              />
            </div>
            <div className="login-links">
              <button type="button" className="login-link" onClick={() => navigate('/signup')} disabled={isPending}>Sign up</button>
              <button type="button" className="login-link" onClick={() => navigate('/forgot-password')} disabled={isPending}>Forgot password?</button>
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            className="login-submit-btn"
            onClick={handleLogin}
            disabled={isPending}
          >
            {isPending ? 'Logging in...' : 'Log In'}
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Login
