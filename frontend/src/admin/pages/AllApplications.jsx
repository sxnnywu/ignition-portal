import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApplications, updateApplicationStatus, exportCsv } from '../api/adminApi';
import FilterTabs from '../../components/shared/FilterTabs';
import StatusBadge from '../../components/shared/StatusBadge';
import AvatarInitials from '../../components/shared/AvatarInitials';
import Pagination from '../../components/shared/Pagination';
import { SearchIcon, ExportIcon, ChevronDownIcon } from '../../components/shared/Icons';
import useCachedFetch from '../../hooks/useCachedFetch';
import { CACHE_KEYS, invalidateCacheByPrefix } from '../../lib/cache';
import './AllApplications.css';

const STATUS_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Waitlisted', value: 'waitlisted' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Reviewed', value: 'under_review' },
  { label: 'Pending', value: 'submitted' },
];

const SORT_OPTIONS = [
  { label: 'Date Submitted', value: 'submittedAt' },
  { label: 'Score', value: 'score' },
  { label: 'Status', value: 'status' },
];

const QUICK_STATUSES = ['submitted', 'under_review', 'accepted', 'waitlisted', 'rejected'];

const STATUS_LABELS = {
  submitted: 'Pending',
  under_review: 'Reviewed',
  accepted: 'Accepted',
  waitlisted: 'Waitlist',
  rejected: 'Rejected',
};

export default function AllApplications({ onDataChange }) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('submittedAt');
  const [order] = useState('desc');
  const [page, setPage] = useState(1);
  const [changingStatus, setChangingStatus] = useState(null);

  const params = useMemo(
    () => ({ page, limit: 20, status: statusFilter, search, sort, order }),
    [page, statusFilter, search, sort, order],
  );

  const cacheKey = CACHE_KEYS.adminApps(params);

  const fetchFn = useCallback(
    () => fetchApplications(params),
    [params],
  );

  const { data, loading, refresh } = useCachedFetch(cacheKey, fetchFn);

  const applications = data?.applications || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  async function handleStatusChange(appId, newStatus) {
    setChangingStatus(appId);
    try {
      await updateApplicationStatus(appId, newStatus);
      invalidateCacheByPrefix('admin-apps:');
      await refresh();
      onDataChange?.();
    } catch {
      // silent
    } finally {
      setChangingStatus(null);
    }
  }

  async function handleExport() {
    try {
      await exportCsv({ status: statusFilter, search });
    } catch {
      // silent
    }
  }

  function formatId(id) {
    if (!id) return '--';
    return id.length > 6 ? id.slice(-6) : id;
  }

  return (
    <div className="all-apps">
      <div className="all-apps-header">
        <h1 className="all-apps-title">All Applications</h1>
        <div className="all-apps-header-actions">
          <form className="all-apps-search" onSubmit={handleSearchSubmit}>
            <SearchIcon size={18} />
            <input
              type="text"
              className="all-apps-search-input"
              placeholder="Search applicants...."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </form>
          <button className="all-apps-export-btn" onClick={handleExport}>
            Export CSV
            <ExportIcon size={18} />
          </button>
        </div>
      </div>

      <FilterTabs
        tabs={STATUS_TABS}
        active={statusFilter}
        onChange={v => { setStatusFilter(v); setPage(1); }}
      />

      <div className="all-apps-table-container">
        <div className="all-apps-table-header">
          <span className="all-apps-table-label">Applications</span>
          <div className="all-apps-sort">
            <span className="all-apps-sort-label">Sort by:</span>
            <div className="all-apps-sort-select-wrap">
              <select
                className="all-apps-sort-select"
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(1); }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDownIcon size={14} color="#4a3524" />
            </div>
          </div>
        </div>

        <table className="all-apps-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Applicant</th>
              <th>School</th>
              <th>Quick Actions</th>
              <th>Status</th>
              <th>Score</th>
              <th>Reviews</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="all-apps-loading">Loading...</td></tr>
            ) : applications.length === 0 ? (
              <tr><td colSpan="7" className="all-apps-empty">No applications found</td></tr>
            ) : (
              applications.map(app => (
                <tr key={app._id}>
                  <td className="all-apps-cell-id">{formatId(app._id)}</td>
                  <td>
                    <div className="all-apps-applicant">
                      <AvatarInitials name={app.user?.name || '?'} size={32} />
                      <span>{app.user?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="all-apps-cell-school">{app.education?.institution || '--'}</td>
                  <td>
                    <div className="all-apps-quick-action">
                      <select
                        className="all-apps-status-select"
                        value={app.status}
                        disabled={changingStatus === app._id}
                        onChange={e => handleStatusChange(app._id, e.target.value)}
                      >
                        {QUICK_STATUSES.map(s => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s] || s}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon size={14} color="#7a5230" />
                    </div>
                  </td>
                  <td><StatusBadge status={app.status} /></td>
                  <td className="all-apps-cell-score">{app.avgScore ?? '--'}</td>
                  <td>
                    <button
                      className="all-apps-view-btn"
                      onClick={() => navigate(`/admin/application/${app._id}`)}
                    >
                      View &rarr;
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={p => setPage(p)}
      />
    </div>
  );
}
