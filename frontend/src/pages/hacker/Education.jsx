import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApplicationDraft } from '../../lib/applicationDraftContext'
import './Info.css'
import './portal.css'
import logoImg from '../../assets/logo.svg'
import checkCircleImg from '../../assets/backgrounds/info-check-circle.svg'
import UserIdBadge from '../../components/hacker/UserIdBadge'

// Step 2 — education and hackathon experience, side by side.
function Education() {
  const navigate = useNavigate()
  const { draft, updateSlice, saveDraft } = useApplicationDraft()
  const education = draft.education
  const experience = draft.experience
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const setEducation = (field) => (e) => {
    updateSlice('education', { ...education, [field]: e.target.value })
    setSaved(false)
  }
  const setExperience = (field) => (e) => {
    updateSlice('experience', { ...experience, [field]: e.target.value })
    setSaved(false)
  }

  const programRequired = education.level === 'undergraduate' || education.level === 'graduate'

  const isComplete =
    education.institution.trim() &&
    education.level &&
    education.coop &&
    (!programRequired || education.program.trim()) &&
    experience.attended2025 &&
    experience.hackathonsAttended

  const handleContinue = async () => {
    setLoading(true)
    try {
      await saveDraft()
      navigate('/teammates')
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
      await saveDraft()
      setSaved(true)
    } catch (error) {
      console.error('Error saving education:', error)
      alert(error.message || 'Error saving your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="info hp-page">
      <UserIdBadge />
      <div className="hp-stage">
      <div className="info-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="info-logo" />
        <span className="info-header-text">IGNITION HACKS V7</span>
      </div>

      <div className="info-card hp-card">
        <div className="info-card-body">
          <div className="info-card-top">
            <div className="info-step-row">
              <span className="info-step">Step 2</span>
              {saved ? (
                <div className="info-saved">
                  <span className="info-saved-text">Saved</span>
                  <img src={checkCircleImg} alt="" className="info-check-icon" />
                </div>
              ) : (
                <span className="info-unsaved-text">Unsaved</span>
              )}
            </div>
            <p className="info-title">YOUR BACKGROUND</p>
            <div className="info-subtitle-block">
              <p className="info-subtitle">Tell us about your education and hackathon experience!</p>
              <p className="info-required">Required*</p>
            </div>
          </div>

          <div className="info-form">
            <div className="info-form-row">
              {/* Education */}
              <div className="info-form-section">
                <label className="info-section-label">Education *</label>
                <div className="info-field-row">
                  <input type="text" placeholder="Educational institution" className="info-input" value={education.institution} onChange={setEducation('institution')} />
                  <select className="info-select" value={education.level} onChange={setEducation('level')}>
                    <option value="" disabled>Level of education</option>
                    <option value="high-school">High School</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="graduate">Graduate</option>
                    <option value="bootcamp">Bootcamp</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="info-field-row">
                  <input type="text" placeholder={programRequired ? 'Program name' : 'Program name (optional)'} className="info-input" value={education.program} onChange={setEducation('program')} />
                  <select className="info-select" value={education.coop} onChange={setEducation('coop')}>
                    <option value="" disabled>Co-op student?</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              {/* Hackathon Experience */}
              <div className="info-form-section">
                <label className="info-section-label">Hackathon Experience *</label>
                <div className="info-field-row">
                  <select className="info-select" value={experience.attended2025} onChange={setExperience('attended2025')}>
                    <option value="" disabled>Attended IgnitionHacks 2025?</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  <select className="info-select" value={experience.hackathonsAttended} onChange={setExperience('hackathonsAttended')}>
                    <option value="" disabled>Hackathons attended?</option>
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
        </div>

        <div className="info-nav">
          <button className="info-outline-btn" onClick={() => navigate('/info')}>Back</button>
          <div className="info-nav-right">
            <button className="info-filled-btn" onClick={handleContinue} disabled={!isComplete || loading}>Continue</button>
            <button className="info-outline-btn" onClick={handleSaveDraft} disabled={loading}>Save Draft</button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Education
