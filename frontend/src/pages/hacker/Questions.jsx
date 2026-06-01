import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Questions.css'
import logoImg from '../../assets/logo.svg'
import cloudImg from '../../assets/backgrounds/landing-cloud.svg'
import iggyImg from '../../assets/backgrounds/landing-iggy.svg'
import sunImg from '../../assets/backgrounds/info-sun.svg'
import circleImg from '../../assets/backgrounds/info-circle.svg'
import checkCircleImg from '../../assets/backgrounds/info-check-circle.svg'
import UserIdBadge from '../../components/hacker/UserIdBadge'
import { getToken } from '../../lib/auth'
import { apiUrl } from '../../lib/api'

// Fixed application questions, each with a hard character limit.
const QUESTIONS = [
  {
    key: 'admireDescribe',
    label: 'How do you think the person you admire the most would describe you?',
    limit: 100,
  },
  {
    key: 'proudProject',
    label: "What project or build are you most proud of (doesn't have to be technical)?",
    limit: 500,
  },
  {
    key: 'motivation',
    label:
      'What motivates you to participate in hackathons? How would you describe your previous experience in hackathons (or group projects if this is your first hackathon)?',
    limit: 500,
  },
]

function Questions() {
  const navigate = useNavigate()
  const [responses, setResponses] = useState({
    admireDescribe: '',
    proudProject: '',
    motivation: '',
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const isComplete = QUESTIONS.every((q) => responses[q.key].trim() !== '')

  const handleChange = (q, value) => {
    // enforce the character limit as the user types
    if (value.length > q.limit) return
    setResponses((prev) => ({ ...prev, [q.key]: value }))
    setSaved(false)
  }

  const saveResponses = async () => {
    const token = getToken()
    if (!token) {
      alert('You must be logged in to save your application. Please log in and try again.')
      return false
    }
    const response = await fetch(apiUrl('/applications'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ responses, status: 'draft' }),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || 'Failed to save your answers')
    }
    return true
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (await saveResponses()) setSaved(true)
    } catch (error) {
      console.error('Error saving questions data:', error)
      alert(error.message || 'Error saving your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = async () => {
    setLoading(true)
    try {
      if (await saveResponses()) navigate('/finish')
    } catch (error) {
      console.error('Error saving questions data:', error)
      alert(error.message || 'Error saving your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="questions">
      <UserIdBadge />
      <div className="questions-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="questions-logo" />
        <span className="questions-header-text">IGNITION HACKS V7</span>
      </div>

      <img src={sunImg} alt="" className="questions-sun" />
      <img src={circleImg} alt="" className="questions-circle" />
      <img src={cloudImg} alt="" className="questions-cloud" />
      <img src={iggyImg} alt="" className="questions-iggy" />

      <div className="questions-card">
        <div className="questions-card-body">
          <div className="questions-card-top">
            <div className="questions-step-row">
              <span className="questions-step">Step 5</span>
              {saved ? (
                <div className="questions-saved">
                  <span className="questions-saved-text">Saved</span>
                  <img src={checkCircleImg} alt="" className="questions-check-icon" />
                </div>
              ) : (
                <span className="questions-unsaved-text">Unsaved</span>
              )}
            </div>
            <p className="questions-title">IGNITION HACKS INFO</p>
            <div className="questions-subtitle-block">
              <p className="questions-subtitle">Some other questions that help us make this hackathon great!</p>
            </div>
          </div>

          <div className="questions-form">
            {QUESTIONS.map((q) => {
              const value = responses[q.key]
              const atLimit = value.length >= q.limit
              return (
                <div className="questions-form-section" key={q.key}>
                  <label className="questions-section-label">{q.label} *</label>
                  <textarea
                    className="questions-textarea"
                    placeholder="Your answer"
                    value={value}
                    maxLength={q.limit}
                    onChange={(e) => handleChange(q, e.target.value)}
                  />
                  <span className={`questions-word-count${atLimit ? ' questions-word-count--limit' : ''}`}>
                    {value.length} / {q.limit} characters
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="questions-nav">
          <button className="questions-outline-btn" onClick={() => navigate('/teammates')}>Back</button>
          <div className="questions-nav-right">
            <button
              className="questions-filled-btn"
              onClick={handleContinue}
              disabled={!isComplete || loading}
            >
              Continue
            </button>
            <button className="questions-outline-btn" onClick={handleSave} disabled={loading}>Save Draft</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Questions
