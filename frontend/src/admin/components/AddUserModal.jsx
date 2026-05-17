import { useState } from 'react';
import { CloseIcon } from './Icons';
import { createUser } from '../api/adminApi';
import './AddUserModal.css';

export default function AddUserModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('reviewer');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await createUser({ name: name.trim(), email: email.trim(), role, password });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="add-user-overlay" onClick={onClose}>
      <div className="add-user-modal" onClick={e => e.stopPropagation()}>
        <button className="add-user-close" onClick={onClose}>
          <CloseIcon size={20} />
        </button>
        <h3 className="add-user-title">Add User</h3>
        <form onSubmit={handleSubmit} className="add-user-form">
          <label className="add-user-label">
            Name
            <input
              type="text"
              className="add-user-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
            />
          </label>
          <label className="add-user-label">
            Email
            <input
              type="email"
              className="add-user-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </label>
          <label className="add-user-label">
            Role
            <select className="add-user-select" value={role} onChange={e => setRole(e.target.value)}>
              <option value="reviewer">Reviewer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="add-user-label">
            Password
            <input
              type="password"
              className="add-user-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
            />
          </label>
          {error && <p className="add-user-error">{error}</p>}
          <button type="submit" className="add-user-submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
}
