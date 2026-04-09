// Minimal auth helpers backed by sessionStorage.
// Kept intentionally tiny — no context/provider — and shared between Signup and Landing.

export const getToken = () => sessionStorage.getItem('token')

export const getUser = () => {
  try {
    const raw = sessionStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const setAuth = (token, user) => {
  sessionStorage.setItem('token', token)
  if (user) sessionStorage.setItem('user', JSON.stringify(user))
}

export const clearAuth = () => {
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
}
