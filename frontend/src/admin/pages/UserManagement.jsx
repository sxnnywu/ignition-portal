import { useState, useEffect, useCallback } from 'react';
import { fetchUsers, updateUserRole, deleteUser } from '../api/adminApi';
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

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [changingRole, setChangingRole] = useState(null);

  const loadData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await fetchUsers({
        page,
        limit: 20,
        role: roleFilter,
        search,
      });
      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, totalPages: 1 });
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearch(searchInput);
  }

  async function handleRoleChange(userId, newRole) {
    setChangingRole(userId);
    try {
      await updateUserRole(userId, newRole);
      await loadData(pagination.page);
    } catch {
      // silent
    } finally {
      setChangingRole(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget._id);
      setDeleteTarget(null);
      await loadData(pagination.page);
    } catch {
      // silent
    }
  }

  function capitalize(str) {
    return str ? str[0].toUpperCase() + str.slice(1) : '';
  }

  return (
    <div className="user-mgmt">
      <div className="user-mgmt-header">
        <h1 className="user-mgmt-title">User Management</h1>
        <div className="user-mgmt-header-actions">
          <form className="user-mgmt-search" onSubmit={handleSearchSubmit}>
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

      <FilterTabs tabs={ROLE_TABS} active={roleFilter} onChange={v => setRoleFilter(v)} />

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
            {loading ? (
              <tr><td colSpan="5" className="user-mgmt-loading">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" className="user-mgmt-empty">No users found</td></tr>
            ) : (
              users.map(user => (
                <tr key={user._id}>
                  <td>
                    <div className="user-mgmt-name">
                      <AvatarInitials name={user.name || '?'} size={32} />
                      <span>{user.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="user-mgmt-cell-email">{user.email}</td>
                  <td>
                    <div className="user-mgmt-role-wrap">
                      <select
                        className="user-mgmt-role-select"
                        value={user.role}
                        disabled={changingRole === user._id}
                        onChange={e => handleRoleChange(user._id, e.target.value)}
                      >
                        {ROLE_OPTIONS.map(r => (
                          <option key={r} value={r}>{capitalize(r)}</option>
                        ))}
                      </select>
                      <ChevronDownIcon size={14} color="#7a5230" />
                    </div>
                  </td>
                  <td className="user-mgmt-cell-count">{user.appsReviewed || 0}</td>
                  <td>
                    <button
                      className="user-mgmt-remove-btn"
                      onClick={() => setDeleteTarget(user)}
                    >
                      Remove
                      <TrashIcon size={16} />
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
        onPageChange={p => loadData(p)}
      />

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => loadData(1)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Remove User"
          message={`Are you sure you want to remove ${deleteTarget.name}? This will also delete their applications and reviews.`}
          confirmLabel="Remove"
          isDestructive
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
