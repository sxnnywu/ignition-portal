import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './Experience.css'
import experienceBg from './assets/backgrounds/experience.png'
import backBtn from './assets/buttons/back.png'
import continueBtn from './assets/buttons/continue.png'

function Experience() {
  const navigate = useNavigate()
  const [attended2025, setAttended2025] = useState('')
  const [hackathonsAttended, setHackathonsAttended] = useState('')
  const [loading, setLoading] = useState(false)

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
      <div className="experience-content">
        <img src={experienceBg} alt="" className="experience-bg" />

        <div className="experience-form">
          <div className="experience-form-section">
            <label className="experience-section-label">Did you attend IgnitionHacks 2025?</label>
            <div className="experience-field-row">
              <select 
                className="experience-select"
                value={attended2025}
                onChange={(e) => setAttended2025(e.target.value)}
              >
                <option value="" disabled>
                  Select
                </option>
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
                <option value="" disabled>
                  Select
                </option>
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

        <button className="experience-back-btn" onClick={() => navigate('/education')}>
          <img src={backBtn} alt="Back" />
        </button>
        <button 
          className="experience-continue-btn" 
          onClick={handleContinue}
          disabled={loading}
        >
          <img src={continueBtn} alt="Continue" />
        </button>
      </div>
    </div>
  )
}

export default Experience