import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHackerPortalScale } from '../../lib/useHackerPortalScale'
import { useApplicationDraft } from '../../lib/applicationDraftContext'
import './Experience.css'
import './portal.css'
import logoImg from '../../assets/logo.svg'
import checkCircleImg from '../../assets/backgrounds/info-check-circle.svg'
import UserIdBadge from '../../components/hacker/UserIdBadge'

function Experience() {
  const navigate = useNavigate()
  const stageRef = useHackerPortalScale()
  const { draft, updateSlice, saveDraft } = useApplicationDraft()
  const { attended2025, hackathonsAttended } = draft.experience
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const isComplete = attended2025 && hackathonsAttended

  const setField = (field) => (e) => {
    updateSlice('experience', { ...draft.experience, [field]: e.target.value })
    setSaved(false)
  }

  const handleContinue = async () => {
    setLoading(true)
    try {
      await saveDraft()
      navigate('/teammates')
    } catch (error) {
      console.error('Error saving experience data:', error)
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
      console.error('Error saving experience data:', error)
      alert(error.message || 'Error saving your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="experience hp-page" ref={stageRef}>
      <UserIdBadge />
      <div className="hp-stage">
      <div className="experience-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="experience-logo" />
        <span className="experience-header-text">IGNITION HACKS V7</span>
      </div>

      <div className="experience-card hp-card">
        <div className="experience-card-body">
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
              <p className="experience-subtitle">Tell us about the hackathons you've been to in the past!</p>
            </div>
          </div>

          <div className="experience-form">
            <div className="experience-form-section">
              <label className="experience-section-label">Did you attend IgnitionHacks 2025?</label>
              <div className="experience-field-row">
                <select
                  className="experience-select"
                  value={attended2025}
                  onChange={setField('attended2025')}
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
                  onChange={setField('hackathonsAttended')}
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
            <button className="experience-outline-btn" onClick={handleSaveDraft} disabled={loading}>Save Draft</button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Experience
