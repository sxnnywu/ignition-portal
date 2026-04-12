import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './Landing.jsx'
import Login from './Login.jsx'
import Signup from './Signup.jsx'
import ForgotPassword from './ForgotPassword.jsx'
import Dashboard from './Dashboard.jsx'
import Info from './Info.jsx'
import Education from './Education.jsx'
import Experience from './Experience.jsx'
import Teammates from './Teammates.jsx'
import Submission from './pages/Submission'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/info" element={<Info />} />
        <Route path="/education" element={<Education />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/teammates" element={<Teammates />} />
        <Route path="/submission/:id" element={<Submission />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
