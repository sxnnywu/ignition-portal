import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Signup.css'
import signupBg from './assets/backgrounds/sign-up-bg.png'
import signupBtn from './assets/buttons/signup-button.png'
import { setAuth } from './lib/auth'

// Matches the backend's password rule in backend/src/routes/signup.js so we can give
// immediate feedback without round-tripping a 400.
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
    e.preventDefault()
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
      // Backend User model uses a single `name` field, so concatenate here.
      const res = await fetch('/signup', {
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

  return (
    <div className="signup">
      {/* Full-page pre-rendered background: header, iggy, empty cream card with
          "IGNITION HACKS" title + "Join us for Ignition Hacks V7!" subtitle are
          all baked into the PNG. We only overlay the interactive form. */}
      <div className="signup-inner">
        <img src={signupBg} alt="" className="signup-bg" aria-hidden="true" />

        <form className="signup-card" onSubmit={handleSubmit} noValidate>
          <div className="signup-field-row">
            <input
              type="text"
              className="signup-input"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isPending}
              autoComplete="given-name"
            />
            <input
              type="text"
              className="signup-input"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isPending}
              autoComplete="family-name"
            />
          </div>

          <input
            type="email"
            className="signup-input signup-input-full"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            autoComplete="email"
          />

          <input
            type="password"
            className="signup-input signup-input-full"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            autoComplete="new-password"
          />

          <p className="signup-login-hint">
            Already have an account? <span className="signup-login-link">Log in</span>
          </p>

          {error && <p className="signup-error">{error}</p>}

          <button
            type="submit"
            className="signup-submit-btn"
            disabled={isPending}
            aria-label={isPending ? 'Signing up...' : 'Sign up'}
          >
            <img
              src={signupBtn}
              alt=""
              style={isPending ? { opacity: 0.5 } : undefined}
            />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Signup
