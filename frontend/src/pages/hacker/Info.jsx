import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Country, State } from 'country-state-city'
import './Info.css'
import logoImg from '../../assets/logo.svg'
import cloudImg from '../../assets/backgrounds/landing-cloud.svg'
import iggyImg from '../../assets/backgrounds/landing-iggy.svg'
import sunImg from '../../assets/backgrounds/info-sun.svg'
import circleImg from '../../assets/backgrounds/info-circle.svg'
import checkCircleImg from '../../assets/backgrounds/info-check-circle.svg'
import UserIdBadge from '../../components/hacker/UserIdBadge'
import { getToken } from '../../lib/auth'
import { apiUrl } from '../../lib/api'

const allCountries = Country.getAllCountries()

function Info() {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  // first/last name are taken from the signed-in user, so they aren't collected here
  const [form, setForm] = useState({
    gender: '', age: '', ethnicity: '',
    country: '', city: '', state: ''
  })

  const set = field => e => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setSaved(false)
  }

  const states = form.country ? State.getStatesOfCountry(form.country) : []

  const isComplete =
    form.gender &&
    form.age &&
    form.ethnicity &&
    form.country &&
    form.city.trim() &&
    (states.length === 0 || form.state)

  const savePersonal = async () => {
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
      body: JSON.stringify({ personal: form, status: 'draft' }),
    })
    if (!response.ok) throw new Error('Failed to save info')
    return true
  }

  const handleContinue = async () => {
    setLoading(true)
    try {
      if (await savePersonal()) navigate('/education')
    } catch (error) {
      console.error('Error saving info:', error)
      alert('Error saving your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    try {
      if (await savePersonal()) setSaved(true)
    } catch (error) {
      console.error('Error saving info:', error)
      alert('Error saving your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="info">
      <UserIdBadge />
      <div className="info-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="info-logo" />
        <span className="info-header-text">IGNITION HACKS V7</span>
      </div>

      <img src={sunImg} alt="" className="info-sun" />
      <img src={circleImg} alt="" className="info-circle" />
      <img src={cloudImg} alt="" className="info-cloud" />
      <img src={iggyImg} alt="" className="info-iggy" />

      <div className="info-card">
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
            <p className="info-title">YOUR INFO</p>
            <div className="info-subtitle-block">
              <p className="info-subtitle">We need some basic info about you to get started!</p>
              <p className="info-required">Required*</p>
            </div>
          </div>

          <div className="info-form">
            <div className="info-form-section">
              <label className="info-section-label">Basics *</label>
              <div className="info-field-row">
                <select className="info-select" value={form.gender} onChange={set('gender')}>
                  <option value="" disabled>Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="nonbinary">Non-binary</option>
                  <option value="other">Other</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
                <input type="number" placeholder="Age" className="info-input" min="1" max="120" value={form.age} onChange={set('age')} />
              </div>
              <div className="info-field-row">
                <select className="info-select" value={form.ethnicity} onChange={set('ethnicity')}>
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

            <div className="info-form-section">
              <label className="info-section-label">Location *</label>
              <div className="info-field-row">
                <select className="info-select" value={form.country} onChange={e => { setForm(prev => ({ ...prev, country: e.target.value, state: '' })); setSaved(false) }}>
                  <option value="" disabled>Country</option>
                  {allCountries.map(c => (
                    <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                  ))}
                </select>
                <input type="text" placeholder="City" className="info-input" value={form.city} onChange={set('city')} />
              </div>
              <div className="info-field-row">
                <select className="info-select" value={form.state} onChange={set('state')} disabled={!form.country}>
                  <option value="" disabled>State/Province</option>
                  {states.map(s => (
                    <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="info-nav">
          <button className="info-outline-btn" onClick={() => navigate('/')}>Back</button>
          <div className="info-nav-right">
            <button className="info-filled-btn" onClick={handleContinue} disabled={!isComplete || loading}>Continue</button>
            <button className="info-outline-btn" onClick={handleSaveDraft} disabled={loading}>Save Draft</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Info
