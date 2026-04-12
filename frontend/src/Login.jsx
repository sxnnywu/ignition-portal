import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'
import loginBg from './assets/backgrounds/login.png'
import loginBtn from './assets/buttons/login-button.png'
import { getToken, setAuth } from './lib/auth'
import { apiUrl } from './lib/api'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (getToken()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
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
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Please try again.')
      }

      setAuth(data.token, data.user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="login">
      <div className="login-content">
        <img src={loginBg} alt="" className="login-bg" aria-hidden="true" />

        <form className="login-form" onSubmit={handleLogin} noValidate>
          <div className="login-form-section">
            <input
              type="email"
              placeholder="Email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              autoComplete="email"
            />
          </div>

          <div className="login-form-section">
            <input
              type="password"
              placeholder="Password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              autoComplete="current-password"
            />
          </div>

          <div className="login-links">
            <button
              type="button"
              className="login-link"
              onClick={() => navigate('/signup')}
              disabled={isPending}
            >
              Sign up
            </button>
            <button
              type="button"
              className="login-link"
              onClick={() => navigate('/forgot-password')}
              disabled={isPending}
            >
              Forgot Password?
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button" disabled={isPending}>
            <img
              src={loginBtn}
              alt={isPending ? 'Logging in...' : 'Log In'}
              style={isPending ? { opacity: 0.5 } : undefined}
            />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
