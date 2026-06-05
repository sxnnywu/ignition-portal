import { useState, useEffect, useRef, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { getToken } from './auth'
import { apiUrl } from './api'
import { DraftContext } from './applicationDraftContext'

/*
  Single source of truth for the hacker application draft.

  The provider wraps every step of the application flow as a layout route. It:
    - fetches the whole draft ONCE on entry and shows a loading screen until
      it's ready (so pages never render empty and then "pop" with data);
    - keeps every slice in memory, so moving between steps preserves edits with
      no re-fetch;
    - exposes saveDraft() to persist the whole draft on demand (Save Draft /
      Continue), and auto-saves once when the user leaves the flow entirely.
*/

// blank draft — input-friendly (numbers held as strings)
const emptyDraft = () => ({
  personal: { gender: '', age: '', ethnicity: '', country: '', city: '', state: '' },
  education: { institution: '', level: '', program: '', coop: '' },
  experience: { attended2025: '', hackathonsAttended: '' },
  teammates: [],
  responses: { admireDescribe: '', proudProject: '', motivation: '' },
})

// build an input-friendly draft from a fetched application document
function draftFromApp(app) {
  const d = emptyDraft()
  if (app.personal) {
    d.personal = {
      gender: app.personal.gender || '',
      age: app.personal.age != null ? String(app.personal.age) : '',
      ethnicity: app.personal.ethnicity || '',
      country: app.personal.country || '',
      city: app.personal.city || '',
      state: app.personal.state || '',
    }
  }
  if (app.education) {
    d.education = {
      institution: app.education.institution || '',
      level: app.education.level || '',
      program: app.education.program || '',
      coop: app.education.coop || '',
    }
  }
  if (app.experience) {
    d.experience = {
      attended2025: app.experience.attended2025 || '',
      hackathonsAttended:
        app.experience.hackathonsAttended != null ? String(app.experience.hackathonsAttended) : '',
    }
  }
  if (Array.isArray(app.teammates)) {
    d.teammates = app.teammates.map((t) => ({ userId: t.userId, name: t.name, email: t.email }))
  }
  if (app.responses) {
    d.responses = {
      admireDescribe: app.responses.admireDescribe || '',
      proudProject: app.responses.proudProject || '',
      motivation: app.responses.motivation || '',
    }
  }
  return d
}

// shape the in-memory draft into the request body the backend expects
function toRequestBody(d) {
  return {
    personal: d.personal,
    education: d.education,
    experience: d.experience,
    teammates: d.teammates.map((t) => ({ userId: t.userId })),
    responses: d.responses,
    status: 'draft',
  }
}

function DraftLoading() {
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EDF7FF',
        fontFamily: "'Jua', sans-serif",
        fontSize: '24px',
        color: 'rgba(0, 0, 0, 0.6)',
      }}
    >
      Loading your application…
    </div>
  )
}

export function ApplicationDraftProvider() {
  const [draft, setDraft] = useState(emptyDraft)
  const [appId, setAppId] = useState(null)
  const [status, setStatus] = useState('draft')
  // only show the loading gate when there's actually a draft to fetch
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  // keep the latest draft in a ref so the save helpers / unmount autosave read
  // fresh state without being re-created on every keystroke
  const draftRef = useRef(draft)
  useEffect(() => {
    draftRef.current = draft
  }, [draft])
  const dirtyRef = useRef(false)

  // fetch the whole draft once, up front
  useEffect(() => {
    const token = getToken()
    if (!token) return // not logged in — nothing to load (loading already false)
    let cancelled = false
    fetch(apiUrl('/applications/me'), { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return
        const app = data?.applications?.[0]
        if (app) {
          setAppId(app._id)
          setStatus(app.status || 'draft')
          setDraft(draftFromApp(app))
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // update a single slice in memory (marks the draft dirty)
  const updateSlice = useCallback((name, value) => {
    dirtyRef.current = true
    setDraft((prev) => ({ ...prev, [name]: value }))
  }, [])

  // persist the whole draft; returns the application id
  const saveDraft = useCallback(async () => {
    const token = getToken()
    if (!token) throw new Error('You must be logged in to save your application.')
    const res = await fetch(apiUrl('/applications'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(toRequestBody(draftRef.current)),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Failed to save your application.')
    }
    const data = await res.json()
    const id = data.application?._id || null
    if (id) setAppId(id)
    dirtyRef.current = false
    return id
  }, [])

  // when the user leaves the flow entirely with unsaved edits, persist once
  useEffect(() => {
    return () => {
      if (!dirtyRef.current) return
      const token = getToken()
      if (!token) return
      fetch(apiUrl('/applications'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(toRequestBody(draftRef.current)),
        keepalive: true,
      }).catch(() => {})
    }
  }, [])

  if (loading) return <DraftLoading />

  return (
    <DraftContext.Provider value={{ draft, updateSlice, saveDraft, appId, status, setStatus }}>
      <Outlet />
    </DraftContext.Provider>
  )
}
