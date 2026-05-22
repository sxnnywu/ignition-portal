import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Signup.css'
import signupBg from '../../assets/backgrounds/sign-up-bg.png'
import signupBtn from '../../assets/buttons/signup-button.png'
import { setAuth } from '../../lib/auth'
import { apiUrl } from '../../lib/api'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
const PASSWORD_RULES =
  'Password must be at least 8 characters and include a lowercase letter, an uppercase letter, and a number.'

function AdminSignup() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [secret, setSecret] = useState('')
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const trimmedFirst = firstName.trim()
    const trimmedLast = lastName.trim()
    const trimmedEmail = email.trim()
    const trimmedSecret = secret.trim()

    if (!trimmedFirst || !trimmedLast || !trimmedEmail || !password || !trimmedSecret) {
      setError('All fields are required.')
      return
    }
    if (!PASSWORD_REGEX.test(password)) {
      setError(PASSWORD_RULES)
      return
    }

    setIsPending(true)
    try {
      const res = await fetch(apiUrl('/signup/admin'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${trimmedFirst} ${trimmedLast}`,
          email: trimmedEmail,
          password,
          secret: trimmedSecret,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || 'Signup failed. Please try again.')
      }
      setAuth(data.token, data.user)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="auth-signup">
      <div className="auth-signup-inner">
        <img src={signupBg} alt="" className="auth-signup-bg" aria-hidden="true" />

        <form className="auth-signup-card" onSubmit={handleSubmit} noValidate>
          <div className="auth-signup-field-row">
            <input
              type="text"
              className="auth-signup-input"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isPending}
              autoComplete="given-name"
            />
            <input
              type="text"
              className="auth-signup-input"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isPending}
              autoComplete="family-name"
            />
          </div>

          <input
            type="email"
            className="auth-signup-input auth-signup-input-full"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            autoComplete="email"
          />

          <input
            type="password"
            className="auth-signup-input auth-signup-input-full"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            autoComplete="new-password"
          />

          <input
            type="password"
            className="auth-signup-input auth-signup-input-full"
            placeholder="Admin secret code"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            disabled={isPending}
            autoComplete="off"
          />

          <p className="auth-signup-login-hint">
            Already have an account?{' '}
            <button
              type="button"
              className="auth-signup-login-link"
              onClick={() => navigate('/login')}
              disabled={isPending}
            >
              Log in
            </button>
          </p>

          {error && <p className="auth-signup-error">{error}</p>}

          <button
            type="submit"
            className="auth-signup-submit-btn"
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

export default AdminSignup
