import { useMemo, useState } from 'react'
import StatusBadge from '../../components/shared/StatusBadge'
import './ApplicationTable.css'

const SORT_OPTIONS = [
  { value: 'submitted-desc', label: 'Submitted (Newest)' },
  { value: 'submitted-asc', label: 'Submitted (Oldest)' },
  { value: 'status', label: 'Status' },
  { value: 'score-desc', label: 'Score (High–Low)' },
  { value: 'score-asc', label: 'Score (Low–High)' },
  { value: 'id', label: 'ID' },
]

function formatDate(dateStr) {
  if (!dateStr) return '--'
  const d = new Date(dateStr)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]}. ${d.getDate()}`
}

function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages = [1]
  if (current > 3) pages.push('...')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  if (total > 1) pages.push(total)
  return pages
}

function truncateId(id) {
  if (!id) return '--'
  return id.length > 6 ? id.slice(-6) : id
}

export default function ApplicationTable({
  applications,
  rowsPerPage,
  onActionClick,
}) {
  const [sortBy, setSortBy] = useState('submitted-desc')
  const [currentPage, setCurrentPage] = useState(1)

  const sorted = useMemo(() => {
    const list = [...applications]
    switch (sortBy) {
      case 'submitted-desc':
        list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        break
      case 'submitted-asc':
        list.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
        break
      case 'status':
        list.sort((a, b) => a.reviewStatus.localeCompare(b.reviewStatus))
        break
      case 'score-desc':
        list.sort((a, b) => (b.yourScore ?? -1) - (a.yourScore ?? -1))
        break
      case 'score-asc':
        list.sort((a, b) => (a.yourScore ?? Infinity) - (b.yourScore ?? Infinity))
        break
      case 'id':
        list.sort((a, b) => a._id.localeCompare(b._id))
        break
    }
    return list
  }, [applications, sortBy])

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const pageData = sorted.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage)
  const pageNumbers = getPageNumbers(safePage, totalPages)

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="rv-table-wrapper">
      <div className="rv-table-header">
        <span className="rv-table-title">Applications</span>
        <select
          className="rv-table-sort"
          value={sortBy}
          onChange={handleSortChange}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <table className="rv-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Applicant</th>
            <th>School</th>
            <th>Submitted</th>
            <th>Status</th>
            <th>Your Score</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pageData.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#999' }}>
                No applications found.
              </td>
            </tr>
          ) : (
            pageData.map((app) => (
              <tr key={app._id}>
                <td className="rv-table-cell-id">{truncateId(app._id)}</td>
                <td className="rv-table-cell-applicant">{app.userId?.name || '--'}</td>
                <td className="rv-table-cell-school">{app.answers?.school || '--'}</td>
                <td className="rv-table-cell-submitted">{formatDate(app.submittedAt)}</td>
                <td>
                  <StatusBadge status={app.reviewStatus} />
                </td>
                <td className="rv-table-cell-score">
                  {app.yourScore != null ? app.yourScore : '--'}
                </td>
                <td>
                  <button
                    className="rv-action-btn"
                    onClick={() => onActionClick?.(app)}
                  >
                    {app.reviewStatus === 'reviewed' ? 'Update' : 'Review'}
                    <span className="rv-action-btn-arrow">→</span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="rv-pagination">
          <button
            className="rv-pagination-btn"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage(safePage - 1)}
          >
            Prev
          </button>

          {pageNumbers.map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="rv-pagination-ellipsis">...</span>
            ) : (
              <button
                key={p}
                className={`rv-pagination-btn${p === safePage ? ' rv-pagination-btn--active' : ''}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            className="rv-pagination-btn"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage(safePage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
