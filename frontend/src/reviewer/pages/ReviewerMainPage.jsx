import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PortalSidebar from '../../components/portal/PortalSidebar'
import ApplicationTable from '../components/ApplicationTable'
import './ReviewerMainPage.css'
import ArticleIcon from '../../assets/icons/Article-icon.svg'
import ClockIcon from '../../assets/icons/clock-icon.svg'
import CheckMarkIcon from '../../assets/icons/check-mark-icon.svg'
import { getToken, clearAuth } from '../../lib/auth'
import { apiUrl } from '../../lib/api'

const ROWS_PER_PAGE = 8

const FILTER_KEYS = {
  ALL: 'all',
  PENDING: 'pending',
  REVIEWED: 'reviewed',
}

export default function ReviewerMainPage() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState(FILTER_KEYS.ALL)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) {
      navigate('/', { replace: true })
      return
    }

    let cancelled = false
    const fetchData = async () => {
      try {
        const res = await fetch(apiUrl('/applications/reviewer'), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (cancelled) return

        if (res.status === 401) {
          clearAuth()
          navigate('/', { replace: true })
          return
        }
        if (!res.ok) {
          throw new Error('Failed to load applications')
        }

        const data = await res.json()
        setApplications(data.applications || [])
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [navigate])

  const counts = useMemo(() => {
    let all = 0, pending = 0, reviewed = 0
    for (const app of applications) {
      all++
      if (app.reviewStatus === 'reviewed') reviewed++
      else pending++
    }
    return { all, pending, reviewed }
  }, [applications])

  const sidebarItems = [
    { key: FILTER_KEYS.ALL, label: 'All Applications', icon: ArticleIcon, count: counts.all },
    { key: FILTER_KEYS.PENDING, label: 'Pending Review', icon: ClockIcon, count: counts.pending },
    { key: FILTER_KEYS.REVIEWED, label: 'My Reviews', icon: CheckMarkIcon, count: counts.reviewed },
  ]

  const filtered = useMemo(() => {
    let list = applications
    if (activeFilter === FILTER_KEYS.PENDING) {
      list = list.filter((a) => a.reviewStatus === 'pending')
    } else if (activeFilter === FILTER_KEYS.REVIEWED) {
      list = list.filter((a) => a.reviewStatus === 'reviewed')
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter((a) => (a.userId?.name || '').toLowerCase().includes(q))
    }
    return list
  }, [applications, activeFilter, searchQuery])

  const handleActionClick = useCallback((app) => {
    // TODO: navigate to review detail page when implemented
    console.log('Action clicked for application:', app._id)
  }, [])

  if (loading) {
    return (
      <div className="rv-main-page">
        <PortalSidebar items={sidebarItems} activeKey={activeFilter} onSelect={setActiveFilter} />
        <div className="rv-main-content">
          <div className="rv-loading">Loading applications...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rv-main-page">
      <PortalSidebar items={sidebarItems} activeKey={activeFilter} onSelect={setActiveFilter} />

      <div className="rv-main-content">
        <div className="rv-content-topbar">
          <h1 className="rv-content-title">Application Pool</h1>
          <input
            type="text"
            className="rv-search-input"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {error && <p className="rv-error">{error}</p>}

        <ApplicationTable
          applications={filtered}
          rowsPerPage={ROWS_PER_PAGE}
          onActionClick={handleActionClick}
        />
      </div>
    </div>
  )
}
