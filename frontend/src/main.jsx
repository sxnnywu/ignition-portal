import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './Landing.jsx'
import Login from './Login.jsx'
import Signup from './Signup.jsx'
import ForgotPassword from './ForgotPassword.jsx'
import ResetPassword from './ResetPassword.jsx'
import Info from './Info.jsx'
import Education from './Education.jsx'
import Experience from './Experience.jsx'
import Teammates from './Teammates.jsx'
import Questions from './Questions.jsx'
import FinishApp from './FinishApp.jsx'
import Submission from './pages/Submission'
import ReviewerSignup from './ReviewerSignup.jsx'
import AdminSignup from './AdminSignup.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import ReviewerDashboard from './pages/ReviewerDashboard.jsx'
import ReviewerApplicationDetail from './pages/ReviewerApplicationDetail.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminApplicationDetail from './pages/AdminApplicationDetail.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/reviewer" element={<ReviewerSignup />} />
        <Route path="/signup/admin" element={<AdminSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/info" element={<Info />} />
        <Route path="/education" element={<Education />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/teammates" element={<Teammates />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/finish" element={<FinishApp />} />
        <Route path="/submission/:id" element={<Submission />} />
        <Route path="/reviewer/dashboard" element={
          <ProtectedRoute allowedRoles={['reviewer']}>
            <ReviewerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/reviewer/application/:id" element={
          <ProtectedRoute allowedRoles={['reviewer']}>
            <ReviewerApplicationDetail />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/application/:id" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminApplicationDetail />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
