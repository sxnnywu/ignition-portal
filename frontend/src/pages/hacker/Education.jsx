import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Education.css'
import logoImg from '../../assets/logo.svg'
import cloudImg from '../../assets/backgrounds/landing-cloud.svg'
import iggyImg from '../../assets/backgrounds/landing-iggy.svg'
import sunImg from '../../assets/backgrounds/info-sun.svg'
import circleImg from '../../assets/backgrounds/info-circle.svg'
import checkCircleImg from '../../assets/backgrounds/info-check-circle.svg'
import UserIdBadge from '../../components/hacker/UserIdBadge'
import { getToken } from '../../lib/auth'
import { apiUrl } from '../../lib/api'

function Education() {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    institution: '', level: '', program: '', coop: ''
  })

  const set = field => e => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setSaved(false)
  }

  // program is only required for undergraduate / graduate students
  const programRequired = form.level === 'undergraduate' || form.level === 'graduate'

  const isComplete =
    form.institution.trim() &&
    form.level &&
    form.coop &&
    (!programRequired || form.program.trim())

  const saveEducation = async () => {
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
      body: JSON.stringify({ education: form, status: 'draft' }),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || 'Failed to save education')
    }
    return true
  }

  const handleContinue = async () => {
    setLoading(true)
    try {
      if (await saveEducation()) navigate('/experience')
    } catch (error) {
      console.error('Error saving education:', error)
      alert(error.message || 'Error saving your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    try {
      if (await saveEducation()) setSaved(true)
    } catch (error) {
      console.error('Error saving education:', error)
      alert(error.message || 'Error saving your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="education">
      <UserIdBadge />
      <div className="education-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="education-logo" />
        <span className="education-header-text">IGNITION HACKS V7</span>
      </div>

      <img src={sunImg} alt="" className="education-sun" />
      <img src={circleImg} alt="" className="education-circle" />
      <img src={cloudImg} alt="" className="education-cloud" />
      <img src={iggyImg} alt="" className="education-iggy" />

      <div className="education-card">
        <div className="education-card-body">
          <div className="education-card-top">
            <div className="education-step-row">
              <span className="education-step">Step 2</span>
              {saved ? (
                <div className="education-saved">
                  <span className="education-saved-text">Saved</span>
                  <img src={checkCircleImg} alt="" className="education-check-icon" />
                </div>
              ) : (
                <span className="education-unsaved-text">Unsaved</span>
              )}
            </div>
            <p className="education-title">YOUR EDUCATION</p>
            <div className="education-subtitle-block">
              <p className="education-subtitle">Tell us about your academic background!</p>
              <p className="education-required">Required*</p>
            </div>
          </div>

          <div className="education-form">
            <div className="education-form-section">
              <label className="education-section-label">School *</label>
              <div className="education-field-row">
                <input type="text" placeholder="Educational institution" className="education-input" value={form.institution} onChange={set('institution')} />
                <select className="education-select" value={form.level} onChange={set('level')}>
                  <option value="" disabled>Level of education</option>
                  <option value="high-school">High School</option>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="graduate">Graduate</option>
                  <option value="bootcamp">Bootcamp</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="education-form-section">
              <label className="education-section-label">Program {programRequired ? '*' : '(optional)'}</label>
              <div className="education-field-row">
                <input type="text" placeholder="Program name" className="education-input" value={form.program} onChange={set('program')} />
                <select className="education-select" value={form.coop} onChange={set('coop')}>
                  <option value="" disabled>Co-op student?</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="education-nav">
          <button className="education-outline-btn" onClick={() => navigate('/info')}>Back</button>
          <div className="education-nav-right">
            <button className="education-filled-btn" onClick={handleContinue} disabled={!isComplete || loading}>Continue</button>
            <button className="education-outline-btn" onClick={handleSaveDraft} disabled={loading}>Save Draft</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Education
