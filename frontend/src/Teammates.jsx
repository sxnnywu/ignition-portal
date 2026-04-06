import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './Teammates.css'
import teammatesBg from './assets/backgrounds/teammates.png'
import backBtn from './assets/buttons/back.png'
import continueBtn from './assets/buttons/continue.png'

function Teammates() {
  const navigate = useNavigate()
  const [teammates, setTeammates] = useState([
    { name: '', email: '' },
    { name: '', email: '' },
    { name: '', email: '' },
  ])
  const [loading, setLoading] = useState(false)

  const handleTeammateChange = (index, field, value) => {
    const updatedTeammates = [...teammates]
    updatedTeammates[index][field] = value
    setTeammates(updatedTeammates)
  }

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
            teammates,
          },
          status: 'draft',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save teammates data')
      }

      navigate('/info')
    } catch (error) {
      console.error('Error saving teammates data:', error)
      alert('Error saving your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="teammates">
      <div className="teammates-content">
        <img src={teammatesBg} alt="" className="teammates-bg" />

        <div className="teammates-form">
          <div className="teammates-form-section">
            <label className="education-section-label">Enter the information of you teammates!</label>
            <div className="teammates-field-row">
              <input 
                type="text" 
                placeholder="Full name" 
                className="teammates-input"
                value={teammates[0].name}
                onChange={(e) => handleTeammateChange(0, 'name', e.target.value)}
              />
              <input 
                type="email" 
                placeholder="Email address" 
                className="teammates-input"
                value={teammates[0].email}
                onChange={(e) => handleTeammateChange(0, 'email', e.target.value)}
              />
            </div>
          </div>

          <div className="teammates-form-section">
            <div className="teammates-field-row">
              <input 
                type="text" 
                placeholder="Full name" 
                className="teammates-input"
                value={teammates[1].name}
                onChange={(e) => handleTeammateChange(1, 'name', e.target.value)}
              />
              <input 
                type="email" 
                placeholder="Email address" 
                className="teammates-input"
                value={teammates[1].email}
                onChange={(e) => handleTeammateChange(1, 'email', e.target.value)}
              />
            </div>
          </div>

          <div className="teammates-form-section">
            <div className="teammates-field-row">
              <input 
                type="text" 
                placeholder="Full name" 
                className="teammates-input"
                value={teammates[2].name}
                onChange={(e) => handleTeammateChange(2, 'name', e.target.value)}
              />
              <input 
                type="email" 
                placeholder="Email address" 
                className="teammates-input"
                value={teammates[2].email}
                onChange={(e) => handleTeammateChange(2, 'email', e.target.value)}
              />
            </div>
          </div>
        </div>

        <button className="teammates-back-btn" onClick={() => navigate('/experience')}>
          <img src={backBtn} alt="Back" />
        </button>
        <button 
          className="teammates-continue-btn" 
          onClick={handleContinue}
          disabled={loading}
        >
          <img src={continueBtn} alt="Continue" />
        </button>
      </div>
    </div>
  )
}

export default Teammates