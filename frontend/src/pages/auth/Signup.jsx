import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Signup.css'
import logoImg from '../../assets/logo.svg'
import iggyImg from '../../assets/backgrounds/landing-iggy.svg'
import { setAuth } from '../../lib/auth'
import { apiUrl } from '../../lib/api'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
const PASSWORD_RULES =
  'Password must be at least 8 characters and include a lowercase letter, an uppercase letter, and a number.'

function Signup() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setError(null)

    const trimmedFirst = firstName.trim()
    const trimmedLast = lastName.trim()
    const trimmedEmail = email.trim()

    if (!trimmedFirst || !trimmedLast || !trimmedEmail || !password) {
      setError('All fields are required.')
      return
    }
    if (!PASSWORD_REGEX.test(password)) {
      setError(PASSWORD_RULES)
      return
    }

    setIsPending(true)
    try {
      const res = await fetch(apiUrl('/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${trimmedFirst} ${trimmedLast}`,
          email: trimmedEmail,
          password,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || 'Signup failed. Please try again.')
      }
      setAuth(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsPending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="signup">
      <div className="signup-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="signup-logo" />
        <span className="signup-header-text">IGNITION HACKS V7</span>
      </div>

      <img src={iggyImg} alt="" className="signup-iggy" />

      <div className="signup-card">
        <div className="signup-card-header">
          <p className="signup-card-title">IGNITION HACKS</p>
          <p className="signup-card-subtitle">Join us for Ignition Hacks V7!</p>
        </div>

        <div className="signup-form-body">
          <div className="signup-fields">
            <div className="signup-inputs-group">
              <div className="signup-name-row">
                <input
                  type="text"
                  placeholder="First name"
                  className="signup-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isPending}
                  autoComplete="given-name"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  className="signup-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isPending}
                  autoComplete="family-name"
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                className="signup-input signup-input--full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isPending}
                autoComplete="email"
              />
              <input
                type="password"
                placeholder="Password"
                className="signup-input signup-input--full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isPending}
                autoComplete="new-password"
              />
            </div>
            <div className="signup-login-link-row">
              <span className="signup-login-text">Already have an account?&nbsp;</span>
              <button type="button" className="signup-login-link" onClick={() => navigate('/login')} disabled={isPending}>Log in</button>
            </div>
          </div>

          {error && <p className="signup-error">{error}</p>}

          <button
            className="signup-submit-btn"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? 'Signing up...' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Signup
