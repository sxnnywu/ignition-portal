import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Signup.css'
import logoImg from './assets/logo.svg'
import iggyImg from './assets/backgrounds/landing-iggy.svg'

function Signup() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)

  const handleSignup = async () => {
    setError(null)
    setIsPending(true)
    try {
      const res = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email,
          password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Signup failed. Please try again.')
      }
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsPending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSignup()
  }

  return (
    <div className="signup">
      {/* Header */}
      <div className="signup-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="signup-logo" />
        <span className="signup-header-text">IGNITION HACKS V7</span>
      </div>

      {/* Iggy */}
      <img src={iggyImg} alt="" className="signup-iggy" />

      {/* Card */}
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
                />
                <input
                  type="text"
                  placeholder="Last name"
                  className="signup-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                className="signup-input signup-input--full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <input
                type="password"
                placeholder="Password"
                className="signup-input signup-input--full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="signup-login-link-row">
              <span className="signup-login-text">Already have an account?&nbsp;</span>
              <button
                type="button"
                className="signup-login-link"
                onClick={() => navigate('/login')}
              >
                Log in
              </button>
            </div>
          </div>

          {error && <p className="signup-error">{error}</p>}

          <button
            className="signup-submit-btn"
            onClick={handleSignup}
            disabled={isPending}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  )
}

export default Signup
