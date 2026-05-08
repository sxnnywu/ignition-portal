import { Navigate } from 'react-router-dom'
import { getToken, getUser } from '../../lib/auth'

/**
 * Route guard that checks authentication and role.
 * - No token → redirect to login
 * - Wrong role → redirect to /not-found
 * - Correct role → render children
 *
 * @param {string[]} allowed - array of allowed roles, e.g. ['applicant'] or ['reviewer', 'admin']
 */
export default function RequireRole({ allowed, children }) {
  const token = getToken()
  if (!token) {
    return <Navigate to="/login" replace />
  }

  const user = getUser()
  const role = user?.role

  if (!role || !allowed.includes(role)) {
    return <Navigate to="/not-found" replace />
  }

  return children
}
