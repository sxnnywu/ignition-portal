import { useState } from 'react';
import FilterTabs from '../components/FilterTabs';
import StatusBadge from '../components/StatusBadge';
import AvatarInitials from '../components/AvatarInitials';
import Pagination from '../components/Pagination';
import { SearchIcon, ExportIcon, ChevronDownIcon } from '../components/Icons';
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

const MOCK_APPS = [
  { _id: 'abc1234', user: { name: 'Bobby Brown' }, answers: { institution: 'University of Waterloo' }, status: 'submitted', avgScore: null, reviewCount: 0 },
  { _id: 'def5678', user: { name: 'Alice Chen' }, answers: { institution: 'University of Toronto' }, status: 'rejected', avgScore: 88, reviewCount: 2 },
  { _id: 'ghi9012', user: { name: 'Marcus Johnson' }, answers: { institution: 'MIT' }, status: 'waitlisted', avgScore: 88, reviewCount: 2 },
  { _id: 'jkl3456', user: { name: 'Sarah Lee' }, answers: { institution: 'Stanford University' }, status: 'accepted', avgScore: 88, reviewCount: 3 },
  { _id: 'mno7890', user: { name: 'David Park' }, answers: { institution: 'University of British Columbia' }, status: 'under_review', avgScore: 88, reviewCount: 1 },
  { _id: 'pqr2345', user: { name: 'Emma Wilson' }, answers: { institution: 'McGill University' }, status: 'under_review', avgScore: 88, reviewCount: 2 },
  { _id: 'stu6789', user: { name: 'James Taylor' }, answers: { institution: 'Carleton University' }, status: 'submitted', avgScore: null, reviewCount: 0 },
  { _id: 'vwx0123', user: { name: 'Priya Sharma' }, answers: { institution: 'University of Waterloo' }, status: 'accepted', avgScore: 92, reviewCount: 3 },
];

export default function TestAllApplications() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('submittedAt');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const filtered = MOCK_APPS.filter(app => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (searchInput && !app.user.name.toLowerCase().includes(searchInput.toLowerCase())) return false;
    return true;
  });

  function shortId(id) {
    return `#${String(id).slice(-4)}`;
  }

  return (
    <div className="all-apps">
      <div className="all-apps-header">
        <h1 className="all-apps-title">All Applications</h1>
        <div className="all-apps-header-actions">
          <form className="all-apps-search" onSubmit={e => e.preventDefault()}>
            <SearchIcon size={18} />
            <input
              type="text"
              className="all-apps-search-input"
              placeholder="Search applicants...."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </form>
          <button className="all-apps-export-btn" onClick={() => alert('CSV export (stub)')}>
            Export CSV
            <ExportIcon size={18} />
          </button>
        </div>
      </div>

      <FilterTabs tabs={STATUS_TABS} active={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} />

      <div className="all-apps-table-container">
        <div className="all-apps-table-header">
          <span className="all-apps-table-label">Applications</span>
          <div className="all-apps-sort">
            <span className="all-apps-sort-label">Sort by:</span>
            <div className="all-apps-sort-select-wrap">
              <select className="all-apps-sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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
            {filtered.length === 0 ? (
              <tr><td colSpan="7" className="all-apps-empty">No applications found</td></tr>
            ) : filtered.map(app => (
              <tr key={app._id}>
                <td className="all-apps-cell-id">{shortId(app._id)}</td>
                <td>
                  <div className="all-apps-applicant">
                    <AvatarInitials name={app.user.name} size={32} />
                    <span>{app.user.name}</span>
                  </div>
                </td>
                <td className="all-apps-cell-school">{app.answers.institution}</td>
                <td>
                  <div className="all-apps-quick-action">
                    <select
                      className="all-apps-status-select"
                      value={app.status}
                      onChange={() => {}}
                    >
                      {QUICK_STATUSES.map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                    <ChevronDownIcon size={14} color="#7a5230" />
                  </div>
                </td>
                <td><StatusBadge status={app.status} /></td>
                <td className="all-apps-cell-score">{app.avgScore ?? '--'}</td>
                <td>
                  <button className="all-apps-view-btn" onClick={() => alert(`View reviews for ${app.user.name}`)}>
                    View &rarr;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={10} onPageChange={p => setPage(p)} />
    </div>
  );
}
