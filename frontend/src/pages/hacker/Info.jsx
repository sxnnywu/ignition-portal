import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Country, State } from 'country-state-city'
import { useApplicationDraft } from '../../lib/applicationDraftContext'
import './Info.css'
import './portal.css'
import logoImg from '../../assets/logo.svg'
import checkCircleImg from '../../assets/backgrounds/info-check-circle.svg'
import UserIdBadge from '../../components/hacker/UserIdBadge'

const allCountries = Country.getAllCountries()

// Step 1 — basic personal info (basics + location).
function Info() {
  const navigate = useNavigate()
  const { draft, updateSlice, saveDraft } = useApplicationDraft()
  const personal = draft.personal
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const setPersonal = (field) => (e) => {
    updateSlice('personal', { ...personal, [field]: e.target.value })
    setSaved(false)
  }

  const states = personal.country ? State.getStatesOfCountry(personal.country) : []

  const isComplete =
    personal.gender &&
    personal.age &&
    personal.ethnicity &&
    personal.country &&
    personal.city.trim() &&
    (states.length === 0 || personal.state)

  const handleContinue = async () => {
    setLoading(true)
    try {
      await saveDraft()
      navigate('/education')
    } catch (error) {
      console.error('Error saving info:', error)
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
      console.error('Error saving info:', error)
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
              <span className="info-step">Step 1</span>
              {saved ? (
                <div className="info-saved">
                  <span className="info-saved-text">Saved</span>
                  <img src={checkCircleImg} alt="" className="info-check-icon" />
                </div>
              ) : (
                <span className="info-unsaved-text">Unsaved</span>
              )}
            </div>
            <p className="info-title">ABOUT YOU</p>
            <div className="info-subtitle-block">
              <p className="info-subtitle">We need some basic info about you to get started!</p>
              <p className="info-required">Required*</p>
            </div>
          </div>

          <div className="info-form">
            <div className="info-form-row">
              {/* Basics */}
              <div className="info-form-section">
                <label className="info-section-label">Basics *</label>
                <div className="info-field-row">
                  <select className="info-select" value={personal.gender} onChange={setPersonal('gender')}>
                    <option value="" disabled>Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="nonbinary">Non-binary</option>
                    <option value="other">Other</option>
                    <option value="prefer-not">Prefer not to say</option>
                  </select>
                  <input type="number" placeholder="Age" className="info-input" min="1" max="120" value={personal.age} onChange={setPersonal('age')} />
                </div>
                <div className="info-field-row">
                  <select className="info-select" value={personal.ethnicity} onChange={setPersonal('ethnicity')}>
                    <option value="" disabled>Ethnicity</option>
                    <option value="asian">Asian</option>
                    <option value="black">Black</option>
                    <option value="hispanic">Hispanic/Latino</option>
                    <option value="white">White</option>
                    <option value="indigenous">Indigenous</option>
                    <option value="middle-eastern">Middle Eastern</option>
                    <option value="pacific-islander">Pacific Islander</option>
                    <option value="multiracial">Multiracial</option>
                    <option value="other">Other</option>
                    <option value="prefer-not">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="info-form-section">
                <label className="info-section-label">Location *</label>
                <div className="info-field-row">
                  <select className="info-select" value={personal.country} onChange={(e) => { updateSlice('personal', { ...personal, country: e.target.value, state: '' }); setSaved(false) }}>
                    <option value="" disabled>Country</option>
                    {allCountries.map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                    ))}
                  </select>
                  <input type="text" placeholder="City" className="info-input" value={personal.city} onChange={setPersonal('city')} />
                </div>
                <div className="info-field-row">
                  <select className="info-select" value={personal.state} onChange={setPersonal('state')} disabled={!personal.country}>
                    <option value="" disabled>State/Province</option>
                    {states.map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="info-nav">
          <button className="info-outline-btn" onClick={() => navigate('/dashboard')}>Back</button>
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

export default Info
