import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Education.css'
import logoImg from '../../assets/logo.svg'
import cloudImg from '../../assets/backgrounds/landing-cloud.svg'
import iggyImg from '../../assets/backgrounds/landing-iggy.svg'
import sunImg from '../../assets/backgrounds/info-sun.svg'
import circleImg from '../../assets/backgrounds/info-circle.svg'
import checkCircleImg from '../../assets/backgrounds/info-check-circle.svg'

function Education() {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    institution: '', level: '', program: '', coop: ''
  })

  const set = field => e => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setSaved(false)
  }

  const isComplete = form.institution.trim() && form.level && form.program.trim() && form.coop

  return (
    <div className="education">
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
              <label className="education-section-label">Program *</label>
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
            <button className="education-filled-btn" onClick={() => navigate('/experience')} disabled={!isComplete}>Continue</button>
            <button className="education-outline-btn" onClick={() => setSaved(true)}>Save Draft</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Education
