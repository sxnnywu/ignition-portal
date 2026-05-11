import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Signup.css'
import signupBg from './assets/backgrounds/signup.png'
import signupBtn from './assets/buttons/signup-button.png'

function ReviewerSignup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [secret, setSecret] = useState('')
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)

  const handleSignup = async () => {
    setError(null)
    setIsPending(true)
    try {
      const res = await fetch('/signup/reviewer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, secret }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Signup failed. Please try again.')
      }
      // account created — send them to login
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="signup">
      <div className="signup-content">
        <img src={signupBg} alt="" className="signup-bg" />

        <div className="signup-form">
          <div className="signup-form-section">
            <input
              type="text"
              placeholder="Full name"
              className="signup-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="signup-form-section">
            <input
              type="email"
              placeholder="Email"
              className="signup-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="signup-form-section">
            <input
              type="password"
              placeholder="Password"
              className="signup-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="signup-form-section">
            <input
              type="password"
              placeholder="Reviewer secret code"
              className="signup-input"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
          </div>

          {error && <p className="signup-error">{error}</p>}

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

          <button className="signup-button" onClick={handleSignup} disabled={isPending}>
            <img
              src={signupBtn}
              alt={isPending ? 'Signing up...' : 'Sign up'}
              style={isPending ? { opacity: 0.5 } : undefined}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReviewerSignup
