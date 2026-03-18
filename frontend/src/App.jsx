import { Routes, Route } from 'react-router-dom'
import Submission from './pages/Submission'

function App() {
  return (
    <Routes>
      <Route path="/submission/:id" element={<Submission />} />
    </Routes>
  )
}

export default App
