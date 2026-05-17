import { apiUrl } from '../../lib/api.js';
import { getToken } from '../../lib/auth.js';

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchStats() {
  const res = await fetch(apiUrl('/api/admin/stats'), { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchApplications({ page = 1, limit = 20, status, search, sort, order } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (status && status !== 'all') params.set('status', status);
  if (search) params.set('search', search);
  if (sort) params.set('sort', sort);
  if (order) params.set('order', order);

  const res = await fetch(apiUrl(`/api/admin/applications?${params}`), { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

export async function updateApplicationStatus(id, status) {
  const res = await fetch(apiUrl(`/applications/${id}/status`), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function exportCsv({ status, search } = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.set('status', status);
  if (search) params.set('search', search);

  const res = await fetch(apiUrl(`/api/admin/export-csv?${params}`), { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to export CSV');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'applications.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export async function fetchUsers({ page = 1, limit = 20, role, search } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (role && role !== 'all') params.set('role', role);
  if (search) params.set('search', search);

  const res = await fetch(apiUrl(`/api/admin/users?${params}`), { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function createUser({ name, email, role, password }) {
  const res = await fetch(apiUrl('/api/admin/users'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name, email, role, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to create user');
  }
  return res.json();
}

export async function updateUserRole(id, role) {
  const res = await fetch(apiUrl(`/api/admin/users/${id}/role`), {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to update role');
  }
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(apiUrl(`/api/admin/users/${id}`), {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to delete user');
  }
  return res.json();
}
