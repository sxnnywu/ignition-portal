import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Teammates.css'
import logoImg from '../../assets/logo.svg'
import cloudImg from '../../assets/backgrounds/landing-cloud.svg'
import iggyImg from '../../assets/backgrounds/landing-iggy.svg'
import sunImg from '../../assets/backgrounds/info-sun.svg'
import circleImg from '../../assets/backgrounds/info-circle.svg'
import checkCircleImg from '../../assets/backgrounds/info-check-circle.svg'
import UserIdBadge from '../../components/hacker/UserIdBadge'
import { getToken, getUser } from '../../lib/auth'
import { apiUrl } from '../../lib/api'

const MAX_TEAMMATES = 3

const emptySlot = () => ({ id: '', loading: false, teammate: null, error: '' })

function Teammates() {
  const navigate = useNavigate()
  const me = getUser()
  const [slots, setSlots] = useState([emptySlot()])
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const updateSlot = (index, patch) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
    setSaved(false)
  }

  const handleIdChange = (index, value) => {
    // editing the id invalidates any previously fetched teammate for this slot
    updateSlot(index, { id: value, teammate: null, error: '' })
  }

  const handleGet = async (index) => {
    const id = slots[index].id.trim()
    if (!id) {
      updateSlot(index, { error: 'Please enter a User ID', teammate: null })
      return
    }
    if (me?._id && id === me._id) {
      updateSlot(index, { error: 'You cannot add yourself', teammate: null })
      return
    }
    // reject ids already added in another slot
    const dup = slots.some((s, i) => i !== index && s.teammate?.userId === id)
    if (dup) {
      updateSlot(index, { error: 'This teammate has already been added', teammate: null })
      return
    }

    const token = getToken()
    if (!token) {
      alert('You must be logged in. Please log in and try again.')
      return
    }

    updateSlot(index, { loading: true, error: '', teammate: null })
    try {
      const res = await fetch(apiUrl(`/applications/teammate/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        updateSlot(index, { loading: false, teammate: null, error: data.message || 'No user found with that ID' })
        return
      }
      const u = data.user
      updateSlot(index, {
        loading: false,
        error: '',
        teammate: { userId: u._id, name: u.name, email: u.email },
      })
    } catch (error) {
      console.error('Error looking up teammate:', error)
      updateSlot(index, { loading: false, teammate: null, error: 'Something went wrong. Please try again.' })
    }
  }

  const addSlot = () => {
    if (slots.length >= MAX_TEAMMATES) return
    setSlots((prev) => [...prev, emptySlot()])
  }

  const removeSlot = (index) => {
    setSlots((prev) => {
      const next = prev.filter((_, i) => i !== index)
      return next.length === 0 ? [emptySlot()] : next
    })
    setSaved(false)
  }

  const collectTeammates = () =>
    slots.filter((s) => s.teammate).map((s) => ({ userId: s.teammate.userId }))

  const saveTeammates = async () => {
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
      body: JSON.stringify({ teammates: collectTeammates(), status: 'draft' }),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || 'Failed to save teammates')
    }
    return true
  }

  const handleContinue = async () => {
    setLoading(true)
    try {
      if (await saveTeammates()) navigate('/questions')
    } catch (error) {
      console.error('Error saving teammates data:', error)
      alert(error.message || 'Error saving your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    try {
      if (await saveTeammates()) setSaved(true)
    } catch (error) {
      console.error('Error saving teammates data:', error)
      alert(error.message || 'Error saving your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const lastSlot = slots[slots.length - 1]
  const canAddAnother = slots.length < MAX_TEAMMATES && lastSlot.teammate

  return (
    <div className="teammates">
      <UserIdBadge />
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
              <p className="teammates-subtitle">
                Enter the ID's of your teammates. The User ID should be shown on the top right of your screen.
              </p>
              <p className="teammates-required">Optional — you can add up to {MAX_TEAMMATES} teammates.</p>
            </div>
          </div>

          <div className="teammates-form">
            {slots.map((slot, index) => (
              <div className="teammates-slot" key={index}>
                <div className="teammates-field-row">
                  <input
                    type="text"
                    placeholder="Teammate User ID"
                    className={`teammates-input-id${slot.error ? ' teammates-input--error' : ''}`}
                    value={slot.id}
                    onChange={(e) => handleIdChange(index, e.target.value)}
                  />
                  <button
                    type="button"
                    className="teammates-get-btn"
                    onClick={() => handleGet(index)}
                    disabled={slot.loading}
                  >
                    {slot.loading ? '...' : 'Get'}
                  </button>
                  {slots.length > 1 && (
                    <button
                      type="button"
                      className="teammates-remove-btn"
                      onClick={() => removeSlot(index)}
                      title="Remove"
                    >
                      ×
                    </button>
                  )}
                </div>

                {slot.error && <p className="teammates-error">{slot.error}</p>}

                {slot.teammate && (
                  <div className="teammates-found">
                    <span className="teammates-found-name">{slot.teammate.name}</span>
                    <span className="teammates-found-email">{slot.teammate.email}</span>
                  </div>
                )}
              </div>
            ))}

            {canAddAnother && (
              <button type="button" className="teammates-add-btn" onClick={addSlot}>
                + Add another teammate
              </button>
            )}
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
            <button className="teammates-outline-btn" onClick={handleSaveDraft} disabled={loading}>Save Draft</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Teammates
