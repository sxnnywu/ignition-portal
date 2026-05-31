import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Questions.css'
import logoImg from '../../assets/logo.svg'
import cloudImg from '../../assets/backgrounds/landing-cloud.svg'
import iggyImg from '../../assets/backgrounds/landing-iggy.svg'
import sunImg from '../../assets/backgrounds/info-sun.svg'
import circleImg from '../../assets/backgrounds/info-circle.svg'
import checkCircleImg from '../../assets/backgrounds/info-check-circle.svg'
import { getToken } from '../../lib/auth'
import { apiUrl } from '../../lib/api'

function Questions() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [whyAttend, setWhyAttend] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const isComplete =
    whyAttend.trim() !== '' &&
    questions.filter(q => q.required).every(q => (answers[q.key] || '').trim() !== '')

  const WORD_LIMIT = 500
  const wordCount = whyAttend.trim() === '' ? 0 : whyAttend.trim().split(/\s+/).length

  const handleWhyAttendChange = (e) => {
    const value = e.target.value
    const words = value.trim() === '' ? 0 : value.trim().split(/\s+/).length
    if (words <= WORD_LIMIT) {
      setWhyAttend(value)
      setSaved(false)
    }
  }

  useEffect(() => {
    const token = getToken()
    fetch(apiUrl('/questions'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => {
        const sorted = (data.questions || []).sort((a, b) => a.order - b.order)
        setQuestions(sorted)
        const initial = {}
        sorted.forEach((q) => { initial[q.key] = '' })
        setAnswers(initial)
      })
      .catch(() => {})
  }, [])

  const handleChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    const token = getToken()
    if (!token) {
      alert('You must be logged in to save your application. Please log in and try again.')
      return
    }
    try {
      const response = await fetch(apiUrl('/applications'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: { ...answers, whyAttend }, status: 'draft' }),
      })
      if (response.ok) setSaved(true)
    } catch (error) {
      console.error('Error saving questions data:', error)
    }
  }

  const handleContinue = async () => {
    const token = getToken()
    if (!token) {
      alert('You must be logged in to save your application. Please log in and try again.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(apiUrl('/applications'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: { ...answers, whyAttend }, status: 'draft' }),
      })
      if (!response.ok) throw new Error('Failed to save questions data')
      navigate('/finish')
    } catch (error) {
      console.error('Error saving questions data:', error)
      alert('Error saving your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="questions">
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
            <div className="questions-form-section">
              <label className="questions-section-label">Why do you want to attend Ignition Hacks? *</label>
              <textarea
                className="questions-textarea"
                placeholder="Your answer"
                value={whyAttend}
                onChange={handleWhyAttendChange}
              />
              <span className={`questions-word-count${wordCount >= WORD_LIMIT ? ' questions-word-count--limit' : ''}`}>
                {wordCount} / {WORD_LIMIT} words
              </span>
            </div>
          </div>

          {questions.length > 0 && (
            <div className="questions-form">
              {questions.map((q) => (
                <div className="questions-form-section" key={q.key}>
                  <label className="questions-section-label">
                    {q.label}{q.required ? ' *' : ''}
                  </label>
                  {q.type === 'text' && (
                    <textarea
                      className="questions-textarea"
                      placeholder="Your answer"
                      value={answers[q.key] || ''}
                      onChange={(e) => handleChange(q.key, e.target.value)}
                    />
                  )}
                  {q.type === 'multichoice' && (
                    <select
                      className="questions-select"
                      value={answers[q.key] || ''}
                      onChange={(e) => handleChange(q.key, e.target.value)}
                    >
                      <option value="" disabled>Select an option</option>
                      {(q.options || []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                  {q.type === 'file' && (
                    <input
                      type="file"
                      className="questions-file"
                      onChange={(e) => handleChange(q.key, e.target.files[0])}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
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
            <button className="questions-outline-btn" onClick={handleSave}>Save Draft</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Questions
