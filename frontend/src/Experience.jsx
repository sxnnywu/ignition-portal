import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Experience.css'
import logoImg from './assets/logo.svg'
import cloudImg from './assets/backgrounds/landing-cloud.svg'
import iggyImg from './assets/backgrounds/landing-iggy.svg'
import sunImg from './assets/backgrounds/info-sun.svg'
import circleImg from './assets/backgrounds/info-circle.svg'
import checkCircleImg from './assets/backgrounds/info-check-circle.svg'

function Experience() {
  const navigate = useNavigate()
  const [attended2025, setAttended2025] = useState('')
  const [hackathonsAttended, setHackathonsAttended] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const isComplete = attended2025 && hackathonsAttended

  const handleContinue = async () => {
    const token = sessionStorage.getItem('token')
    if (!token) {
      alert('You must be logged in to save your application. Please log in and try again.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: {
            attended2025,
            hackathonsAttended,
          },
          status: 'draft',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save experience data')
      }

      navigate('/teammates')
    } catch (error) {
      console.error('Error saving experience data:', error)
      alert('Error saving your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="experience">
      {/* Header */}
      <div className="experience-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="experience-logo" />
        <span className="experience-header-text">IGNITION HACKS V7</span>
      </div>

      {/* Illustrations */}
      <img src={sunImg} alt="" className="experience-sun" />
      <img src={circleImg} alt="" className="experience-circle" />
      <img src={cloudImg} alt="" className="experience-cloud" />
      <img src={iggyImg} alt="" className="experience-iggy" />

      {/* Card */}
      <div className="experience-card">
        <div className="experience-card-body">
          {/* Step header */}
          <div className="experience-card-top">
            <div className="experience-step-row">
              <span className="experience-step">Step 3</span>
              {saved ? (
                <div className="experience-saved">
                  <span className="experience-saved-text">Saved</span>
                  <img src={checkCircleImg} alt="" className="experience-check-icon" />
                </div>
              ) : (
                <span className="experience-unsaved-text">Unsaved</span>
              )}
            </div>
            <p className="experience-title">HACKATHON EXPERIENCE</p>
            <div className="experience-subtitle-block">
              <p className="experience-subtitle">Tell us about the hackathons you&#39;ve been to in the past!</p>
            </div>
          </div>

          {/* Form */}
          <div className="experience-form">
            <div className="experience-form-section">
              <label className="experience-section-label">Did you attend IgnitionHacks 2025?</label>
              <div className="experience-field-row">
                <select
                  className="experience-select"
                  value={attended2025}
                  onChange={(e) => setAttended2025(e.target.value)}
                >
                  <option value="" disabled>Yes/No</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            <div className="experience-form-section">
              <label className="experience-section-label">How many hackathons have you attended?</label>
              <div className="experience-field-row">
                <select
                  className="experience-select"
                  value={hackathonsAttended}
                  onChange={(e) => setHackathonsAttended(e.target.value)}
                >
                  <option value="" disabled>Select</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5 or more</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="experience-nav">
          <button className="experience-outline-btn" onClick={() => navigate('/education')}>Back</button>
          <div className="experience-nav-right">
            <button
              className="experience-filled-btn"
              onClick={handleContinue}
              disabled={!isComplete || loading}
            >
              Continue
            </button>
            <button className="experience-outline-btn" onClick={() => setSaved(true)}>Save Draft</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Experience