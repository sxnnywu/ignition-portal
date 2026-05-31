import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Teammates.css'
import logoImg from '../../assets/logo.svg'
import cloudImg from '../../assets/backgrounds/landing-cloud.svg'
import iggyImg from '../../assets/backgrounds/landing-iggy.svg'
import sunImg from '../../assets/backgrounds/info-sun.svg'
import circleImg from '../../assets/backgrounds/info-circle.svg'
import checkCircleImg from '../../assets/backgrounds/info-check-circle.svg'
import { getToken } from '../../lib/auth'
import { apiUrl } from '../../lib/api'

function Teammates() {
  const navigate = useNavigate()
  const [teammates, setTeammates] = useState([
    { name: '', email: '' },
    { name: '', email: '' },
    { name: '', email: '' },
  ])
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleTeammateChange = (index, field, value) => {
    const updated = [...teammates]
    updated[index] = { ...updated[index], [field]: value }
    setTeammates(updated)
    setSaved(false)
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
        body: JSON.stringify({
          answers: { teammates },
          status: 'draft',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save teammates data')
      }

      navigate('/questions')
    } catch (error) {
      console.error('Error saving teammates data:', error)
      alert('Error saving your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="teammates">
      <div className="teammates-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="teammates-logo" />
        <span className="teammates-header-text">IGNITION HACKS V7</span>
      </div>

      <img src={sunImg} alt="" className="teammates-sun" />
      <img src={circleImg} alt="" className="teammates-circle" />
      <img src={cloudImg} alt="" className="teammates-cloud" />
      <img src={iggyImg} alt="" className="teammates-iggy" />

      <div className="teammates-card">
        <div className="teammates-card-body">
          <div className="teammates-card-top">
            <div className="teammates-step-row">
              <span className="teammates-step">Step 4</span>
              {saved ? (
                <div className="teammates-saved">
                  <span className="teammates-saved-text">Saved</span>
                  <img src={checkCircleImg} alt="" className="teammates-check-icon" />
                </div>
              ) : (
                <span className="teammates-unsaved-text">Unsaved</span>
              )}
            </div>
            <p className="teammates-title">YOUR TEAMMATES</p>
            <div className="teammates-subtitle-block">
              <p className="teammates-subtitle">Enter the information of your teammates.</p>
            </div>
          </div>

          <div className="teammates-form">
            {teammates.map((teammate, index) => (
              <div className="teammates-field-row" key={index}>
                <input
                  type="text"
                  placeholder="Full name"
                  className="teammates-input-name"
                  value={teammate.name}
                  onChange={(e) => handleTeammateChange(index, 'name', e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Email address"
                  className="teammates-input-email"
                  value={teammate.email}
                  onChange={(e) => handleTeammateChange(index, 'email', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="teammates-nav">
          <button className="teammates-outline-btn" onClick={() => navigate('/experience')}>Back</button>
          <div className="teammates-nav-right">
            <button
              className="teammates-filled-btn"
              onClick={handleContinue}
              disabled={loading}
            >
              Continue
            </button>
            <button className="teammates-outline-btn" onClick={() => setSaved(true)}>Save Draft</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Teammates
