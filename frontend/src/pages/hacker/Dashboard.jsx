import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
import headerImg from '../../assets/backgrounds/header.svg'
import iggyImg from '../../assets/iggy.svg'
import appSubmittedBg from '../../assets/backgrounds/app-submitted-bg.png'
import appUnderReviewBg from '../../assets/backgrounds/app-underreview-bg.png'
import appAcceptedBg from '../../assets/backgrounds/app-accepted-bg.png'
import { getToken, clearAuth } from '../../lib/auth'
import { apiUrl } from '../../lib/api'

export const DASHBOARD_STATUS_CONFIG = {
  none: {
    label: 'Not Started',
    showCheck: false,
    cta: { label: 'Start Application', target: () => '/info' },
  },
  draft: {
    label: 'In Progress',
    showCheck: false,
    cta: { label: 'Continue Application', target: () => '/info' },
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

function CheckIcon() {
  return (
    <svg
      className="hk-dash-check-icon"
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

export function DashboardStatusCard({ status, applicationId, onCtaClick }) {
  const config = DASHBOARD_STATUS_CONFIG[status] || DASHBOARD_STATUS_CONFIG.none

  return (
    <div className="hk-dash-card">
      <p className="hk-dash-welcome">Welcome to</p>
      <h1 className="hk-dash-title">IGNITION HACKS</h1>
      <p className="hk-dash-subtitle">Apply now to join this year's super fun hackathon!</p>

      <div className="hk-dash-status-row">
        <div className="hk-dash-status-label-group">
          <span className="hk-dash-status-label">{config.label}</span>
          {config.showCheck && <CheckIcon />}
        </div>

        {config.cta && !config.cta.hitArea && (
          <button
            type="button"
            className="hk-dash-cta-btn"
            onClick={() => onCtaClick?.(config.cta.target(applicationId))}
          >
            {config.cta.label}
          </button>
        )}
      </div>
    </div>
  )
}

export function DashboardStatusPngView({ status }) {
  const config = DASHBOARD_STATUS_CONFIG[status]
  if (!config?.bg) return null

  return (
    <div className="hk-dash-bg-page">
      <div className="hk-dash-bg-wrapper">
        <img src={config.bg} alt={`Application status: ${config.label}`} className="hk-dash-bg-img" />
        {config.cta?.hitArea && (
          <button
            type="button"
            className="hk-dash-accept-hit"
            onClick={() => config.cta.onClick?.()}
          >
            <span className="hk-dash-sr-only">{config.cta.label}</span>
          </button>
        )}
      </div>
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
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
        const res = await fetch(apiUrl('/applications/me'), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (cancelled) return

        if (res.status === 401) {
          clearAuth()
          navigate('/', { replace: true })
          return
        }
        if (res.status === 404) {
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

  if (status === null) {
    return (
      <div className="hk-dash">
        <img src={headerImg} alt="Ignition Hacks V7" className="hk-dash-header" />
        <div className="hk-dash-content">
          <div className="hk-dash-card hk-dash-card-loading">
            <p className="hk-dash-loading">Loading…</p>
          </div>
        </div>
      </div>
    )
  }

  const config = DASHBOARD_STATUS_CONFIG[status] || DASHBOARD_STATUS_CONFIG.none

  if (config.bg) {
    return (
      <>
        <DashboardStatusPngView status={status} />
        {error && <p className="hk-dash-error hk-dash-error-floating">{error}</p>}
      </>
    )
  }

  return (
    <div className="hk-dash">
      <img src={headerImg} alt="Ignition Hacks V7" className="hk-dash-header" />
      <img src={iggyImg} alt="" className="hk-dash-iggy" aria-hidden="true" />

      <div className="hk-dash-content">
        <DashboardStatusCard
          status={status}
          applicationId={applicationId}
          onCtaClick={(target) => navigate(target)}
        />
        {error && <p className="hk-dash-error">{error}</p>}
      </div>
    </div>
  )
}

export default Dashboard
