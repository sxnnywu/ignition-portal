import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHackerPortalScale } from '../../lib/useHackerPortalScale'
import { useApplicationDraft } from '../../lib/applicationDraftContext'
import './Teammates.css'
import './portal.css'
import logoImg from '../../assets/logo.svg'
import checkCircleImg from '../../assets/backgrounds/info-check-circle.svg'
import UserIdBadge from '../../components/hacker/UserIdBadge'
import { getToken, getUser } from '../../lib/auth'
import { apiUrl } from '../../lib/api'

const MAX_TEAMMATES = 3

const emptySlot = () => ({ id: '', loading: false, teammate: null, error: '' })

// turn the saved/in-memory teammate list into editor slots
const slotsFromTeammates = (teammates) =>
  Array.isArray(teammates) && teammates.length > 0
    ? teammates.map((t) => ({ id: t.userId, loading: false, teammate: { ...t }, error: '' }))
    : [emptySlot()]

const resolvedFromSlots = (slots) =>
  slots
    .filter((s) => s.teammate)
    .map((s) => ({ userId: s.teammate.userId, name: s.teammate.name, email: s.teammate.email }))

function Teammates() {
  const navigate = useNavigate()
  const stageRef = useHackerPortalScale()
  const me = getUser()
  const { draft, updateSlice, saveDraft } = useApplicationDraft()
  // transient editor state (loading/error per row) lives locally; the resolved
  // teammates are mirrored into the shared draft so they survive navigation
  const [slots, setSlots] = useState(() => slotsFromTeammates(draft.teammates))
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  // mirror resolved teammates into the shared draft whenever they change
  // (skip the first run so seeding from the draft doesn't mark it dirty)
  const firstSync = useRef(true)
  useEffect(() => {
    if (firstSync.current) {
      firstSync.current = false
      return
    }
    updateSlice('teammates', resolvedFromSlots(slots))
  }, [slots, updateSlice])

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

  const handleContinue = async () => {
    setLoading(true)
    try {
      await saveDraft()
      navigate('/questions')
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
      await saveDraft()
      setSaved(true)
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
    <div className="teammates hp-page" ref={stageRef}>
      <UserIdBadge />
      <div className="hp-stage">
      <div className="teammates-header">
        <img src={logoImg} alt="Ignition Hacks Logo" className="teammates-logo" />
        <span className="teammates-header-text">IGNITION HACKS V7</span>
      </div>

      <div className="teammates-card hp-card">
        <div className="teammates-card-body">
          <div className="teammates-card-top">
            <div className="teammates-step-row">
              <span className="teammates-step">Step 3</span>
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
          <button className="teammates-outline-btn" onClick={() => navigate('/education')}>Back</button>
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
    </div>
  )
}

export default Teammates
