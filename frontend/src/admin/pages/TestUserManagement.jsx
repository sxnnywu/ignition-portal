import { useState } from 'react';
import FilterTabs from '../components/FilterTabs';
import AvatarInitials from '../components/AvatarInitials';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import AddUserModal from '../components/AddUserModal';
import { SearchIcon, PlusIcon, TrashIcon, ChevronDownIcon } from '../components/Icons';
import './UserManagement.css';

const ROLE_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Admin', value: 'admin' },
  { label: 'Reviewer', value: 'reviewer' },
];

const ROLE_OPTIONS = ['admin', 'reviewer', 'applicant'];

const MOCK_USERS = [
  { _id: '1', name: 'Bobby Brown', email: 'bobby@email.ca', role: 'admin', appsReviewed: 16 },
  { _id: '2', name: 'Alice Chen', email: 'alice@email.ca', role: 'reviewer', appsReviewed: 24 },
  { _id: '3', name: 'Marcus Johnson', email: 'marcus@email.ca', role: 'admin', appsReviewed: 8 },
  { _id: '4', name: 'Sarah Lee', email: 'sarah@email.ca', role: 'reviewer', appsReviewed: 16 },
  { _id: '5', name: 'David Park', email: 'david@email.ca', role: 'reviewer', appsReviewed: 12 },
];

export default function TestUserManagement() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchInput && !u.name.toLowerCase().includes(searchInput.toLowerCase())) return false;
    return true;
  });

  function handleRoleChange(userId, newRole) {
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setUsers(prev => prev.filter(u => u._id !== deleteTarget._id));
    setDeleteTarget(null);
  }

  function capitalize(str) {
    return str ? str[0].toUpperCase() + str.slice(1) : '';
  }

  return (
    <div className="user-mgmt">
      <div className="user-mgmt-header">
        <h1 className="user-mgmt-title">User Management</h1>
        <div className="user-mgmt-header-actions">
          <form className="user-mgmt-search" onSubmit={e => e.preventDefault()}>
            <SearchIcon size={18} />
            <input
              type="text"
              className="user-mgmt-search-input"
              placeholder="Search name...."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </form>
          <button className="user-mgmt-add-btn" onClick={() => setShowAddModal(true)}>
            Add User
            <PlusIcon size={18} />
          </button>
        </div>
      </div>

      <FilterTabs tabs={ROLE_TABS} active={roleFilter} onChange={v => { setRoleFilter(v); setPage(1); }} />

      <div className="user-mgmt-table-container">
        <div className="user-mgmt-table-header">
          <span className="user-mgmt-table-label">All Portal Users</span>
        </div>

        <table className="user-mgmt-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Apps Reviewed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="5" className="user-mgmt-empty">No users found</td></tr>
            ) : filtered.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="user-mgmt-name">
                    <AvatarInitials name={user.name} size={32} />
                    <span>{user.name}</span>
                  </div>
                </td>
                <td className="user-mgmt-cell-email">{user.email}</td>
                <td>
                  <div className="user-mgmt-role-wrap">
                    <select
                      className="user-mgmt-role-select"
                      value={user.role}
                      onChange={e => handleRoleChange(user._id, e.target.value)}
                    >
                      {ROLE_OPTIONS.map(r => (
                        <option key={r} value={r}>{capitalize(r)}</option>
                      ))}
                    </select>
                    <ChevronDownIcon size={14} color="#7a5230" />
                  </div>
                </td>
                <td className="user-mgmt-cell-count">{user.appsReviewed}</td>
                <td>
                  <button className="user-mgmt-remove-btn" onClick={() => setDeleteTarget(user)}>
                    Remove
                    <TrashIcon size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={3} onPageChange={p => setPage(p)} />

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => setShowAddModal(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Remove User"
          message={`Are you sure you want to remove ${deleteTarget.name}? This will also delete their applications and reviews.`}
          confirmLabel="Remove"
          isDestructive
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
