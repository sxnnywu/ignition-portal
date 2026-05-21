import { Navigate } from 'react-router-dom'

// wraps a route and redirects to /login if the user's role doesn't match
function ProtectedRoute({ allowedRoles, children }) {
  const role = sessionStorage.getItem('role')
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default ProtectedRoute
