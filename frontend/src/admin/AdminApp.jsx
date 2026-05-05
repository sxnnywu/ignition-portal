import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { getToken, getUser, clearAuth } from '../lib/auth.js';
import { fetchStats } from './api/adminApi';
import AdminNavbar from './components/AdminNavbar';
import AdminSidebar from './components/AdminSidebar';
import AllApplications from './pages/AllApplications';
import UserManagement from './pages/UserManagement';
import './AdminApp.css';

export default function AdminApp() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (!token || !user) {
      clearAuth();
      navigate('/login', { replace: true });
      return;
    }
    if (user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [navigate]);

  const loadStats = async () => {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch {
      // stats are non-critical, sidebar shows zeros
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const token = getToken();
  const user = getUser();
  if (!token || !user || user.role !== 'admin') return null;

  return (
    <div className="admin-app">
      <AdminNavbar />
      <div className="admin-body">
        <AdminSidebar stats={stats} />
        <main className="admin-main">
          <Routes>
            <Route index element={<AllApplications onDataChange={loadStats} />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
