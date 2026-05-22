import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PortalSidebar from '../../components/portal/PortalSidebar'
import ApplicationTable from '../components/ApplicationTable'
import './ReviewerMainPage.css'
import ArticleIcon from '../../assets/icons/Article-icon.svg'
import ClockIcon from '../../assets/icons/clock-icon.svg'
import CheckMarkIcon from '../../assets/icons/check-mark-icon.svg'
import { getToken, clearAuth } from '../../lib/auth'
import { apiUrl } from '../../lib/api'
import useCachedFetch from '../../hooks/useCachedFetch'
import { CACHE_KEYS } from '../../lib/cache'

const ROWS_PER_PAGE = 8

const FILTER_KEYS = {
  ALL: 'all',
  PENDING: 'pending',
  REVIEWED: 'reviewed',
}

async function fetchReviewerApps() {
  const token = getToken()
  const res = await fetch(apiUrl('/applications/reviewer'), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) {
    clearAuth()
    throw new Error('__AUTH_EXPIRED__')
  }
  if (!res.ok) throw new Error('Failed to load applications')
  const data = await res.json()
  return data.applications || []
}

export default function ReviewerMainPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState(FILTER_KEYS.ALL)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    data: applications,
    loading,
    error,
  } = useCachedFetch(CACHE_KEYS.REVIEWER_APPS, fetchReviewerApps)

  // Handle auth expiry from the fetch
  if (error === '__AUTH_EXPIRED__') {
    navigate('/', { replace: true })
    return null
  }

  const appList = applications || []

  const counts = useMemo(() => {
    let all = 0, pending = 0, reviewed = 0
    for (const app of appList) {
      all++
      if (app.reviewStatus === 'reviewed') reviewed++
      else pending++
    }
    return { all, pending, reviewed }
  }, [appList])

  const sidebarItems = [
    { key: FILTER_KEYS.ALL, label: 'All Applications', icon: ArticleIcon, count: counts.all },
    { key: FILTER_KEYS.PENDING, label: 'Pending Review', icon: ClockIcon, count: counts.pending },
    { key: FILTER_KEYS.REVIEWED, label: 'Reviewed by me', icon: CheckMarkIcon, count: counts.reviewed },
  ]

  const filtered = useMemo(() => {
    let list = appList
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
  }, [appList, activeFilter, searchQuery])

  const handleActionClick = useCallback((app) => {
    navigate(`/reviewer/application/${app._id}`)
  }, [navigate])

  if (loading) {
    return (
      <div className="rv-main-page">
        <PortalSidebar title="My Queue" items={sidebarItems} activeKey={activeFilter} onSelect={setActiveFilter} />
        <div className="rv-main-content">
          <div className="rv-loading">Loading applications...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rv-main-page">
      <PortalSidebar title="My Queue" items={sidebarItems} activeKey={activeFilter} onSelect={setActiveFilter} />

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
