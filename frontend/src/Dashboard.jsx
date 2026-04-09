import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
import headerImg from './assets/backgrounds/header.svg'
import iggyImg from './assets/iggy.svg'
import appSubmittedBg from './assets/backgrounds/app-submitted-bg.png'
import appUnderReviewBg from './assets/backgrounds/app-underreview-bg.png'
import appAcceptedBg from './assets/backgrounds/app-accepted-bg.png'
import { getToken, clearAuth } from './lib/auth'

// Per-status copy + CTA for the dashboard.
// `none` / `draft` are rendered as HTML/CSS cards (no finalized PNG yet).
// `submitted` / `under_review` / `accepted` use the pre-rendered full-page PNGs,
// which already bake in the header, iggy, card, title, subtitle, and status label.
// `waitlisted` / `rejected` are intentionally dropped for now — if the backend
// returns either, the fetch handler coerces it to `under_review` as a safe fallback.
export const DASHBOARD_STATUS_CONFIG = {
  none: {
    label: 'Not Started',
    showCheck: false,
    cta: { label: 'Start Application', target: (_id) => '/info' },
  },
  draft: {
    label: 'In Progress',
    showCheck: false,
    cta: { label: 'Continue Application', target: (_id) => '/info' },
  },
  submitted: {
    label: 'Application Submitted',
    showCheck: true,
    bg: appSubmittedBg,
    cta: null,
  },
  under_review: {
    label: 'Under Review',
    showCheck: true,
    bg: appUnderReviewBg,
    cta: null,
  },
  accepted: {
    label: 'Accepted',
    showCheck: true,
    bg: appAcceptedBg,
    cta: {
      label: 'Continue to Dashboard',
      hitArea: true,
      onClick: () => window.alert('Hacker dashboard coming soon'),
    },
  },
}

// Small inline green check icon used beside status labels on the CSS-card states.
function CheckIcon() {
  return (
    <svg
      className="dashboard-check-icon"
      viewBox="0 0 24 24"
      width="1.2em"
      height="1.2em"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="none" stroke="#2bb673" strokeWidth="2" />
      <path
        d="M7.5 12.5l3 3 6-6"
        fill="none"
        stroke="#2bb673"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// HTML/CSS card used for the `none` and `draft` states (no PNG bg).
export function DashboardStatusCard({ status, applicationId, onCtaClick }) {
  const config = DASHBOARD_STATUS_CONFIG[status] || DASHBOARD_STATUS_CONFIG.none

  return (
    <div className="dashboard-card">
      <p className="dashboard-welcome">Welcome to</p>
      <h1 className="dashboard-title">IGNITION HACKS</h1>
      <p className="dashboard-subtitle">Apply now to join this year's super fun hackathon!</p>

      <div className="dashboard-status-row">
        <div className="dashboard-status-label-group">
          <span className="dashboard-status-label">{config.label}</span>
          {config.showCheck && <CheckIcon />}
        </div>

        {config.cta && !config.cta.hitArea && (
          <button
            type="button"
            className="dashboard-cta-btn"
            onClick={() => onCtaClick?.(config.cta.target(applicationId))}
          >
            {config.cta.label}
          </button>
        )}
      </div>
    </div>
  )
}

// Full-page view for statuses that ship a pre-rendered PNG (submitted, under_review, accepted).
// The PNG IS the page — header, iggy, card, title, subtitle, and status label are all baked in.
// For `accepted` we overlay a transparent hit-area over the baked-in "Continue to Dashboard" button.
export function DashboardStatusPngView({ status }) {
  const config = DASHBOARD_STATUS_CONFIG[status]
  if (!config?.bg) return null

  return (
    <div className="dashboard-bg-page">
      <div className="dashboard-bg-wrapper">
        <img src={config.bg} alt={`Application status: ${config.label}`} className="dashboard-bg-img" />
        {config.cta?.hitArea && (
          <button
            type="button"
            className="dashboard-accept-hit"
            onClick={() => config.cta.onClick?.()}
          >
            <span className="dashboard-sr-only">{config.cta.label}</span>
          </button>
        )}
      </div>
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const [status, setStatus] = useState(null) // null = loading
  const [applicationId, setApplicationId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      navigate('/', { replace: true })
      return
    }

    let cancelled = false
    const fetchStatus = async () => {
      try {
        const res = await fetch('/applications/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (cancelled) return

        if (res.status === 401) {
          clearAuth()
          navigate('/', { replace: true })
          return
        }
        if (res.status === 404) {
          // Authenticated but no application yet — treat as `none`.
          setStatus('none')
          return
        }
        if (!res.ok) {
          setStatus('none')
          setError('Could not load your application status.')
          return
        }

        const data = await res.json()
        const app = Array.isArray(data.applications) ? data.applications[0] : null
        if (app) {
          // Backend enum still includes waitlisted/rejected, but the frontend has dropped
          // visual support for those. Coerce either to under_review so nothing crashes.
          const rawStatus = app.status
          const mappedStatus =
            rawStatus === 'waitlisted' || rawStatus === 'rejected' ? 'under_review' : rawStatus
          if (DASHBOARD_STATUS_CONFIG[mappedStatus]) {
            setStatus(mappedStatus)
            setApplicationId(app._id)
          } else {
            setStatus('none')
          }
        } else {
          setStatus('none')
        }
      } catch {
        if (!cancelled) {
          setStatus('none')
          setError('Could not reach the server.')
        }
      }
    }

    fetchStatus()
    return () => {
      cancelled = true
    }
  }, [navigate])

  // Loading state — keep the CSS chrome so the layout doesn't jump.
  if (status === null) {
    return (
      <div className="dashboard">
        <img src={headerImg} alt="Ignition Hacks V7" className="dashboard-header" />
        <div className="dashboard-content">
          <div className="dashboard-card dashboard-card-loading">
            <p className="dashboard-loading">Loading…</p>
          </div>
        </div>
      </div>
    )
  }

  const config = DASHBOARD_STATUS_CONFIG[status] || DASHBOARD_STATUS_CONFIG.none

  // PNG-backed states render as a full-bleed image — no outer header/iggy, no max-width wrapper.
  if (config.bg) {
    return (
      <>
        <DashboardStatusPngView status={status} />
        {error && <p className="dashboard-error dashboard-error-floating">{error}</p>}
      </>
    )
  }

  // HTML/CSS path for `none` and `draft`.
  return (
    <div className="dashboard">
      <img src={headerImg} alt="Ignition Hacks V7" className="dashboard-header" />
      <img src={iggyImg} alt="" className="dashboard-iggy" aria-hidden="true" />

      <div className="dashboard-content">
        <DashboardStatusCard
          status={status}
          applicationId={applicationId}
          onCtaClick={(target) => navigate(target)}
        />
        {error && <p className="dashboard-error">{error}</p>}
      </div>
    </div>
  )
}

export default Dashboard
