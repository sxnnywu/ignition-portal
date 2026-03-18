import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Submission from './pages/Submission'

function App() {
  return (
    <Routes>
      <Route path="/submit/:id" element={<Submission />} />
      <Route path="*" element={<Navigate to="/submit/test" replace />} />
    </Routes>
  )
}

export default App
