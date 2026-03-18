import { createContext, useContext, useState, useMemo } from 'react'

// context for sharing auth state across the app
const AuthContext = createContext(null)

// provider that wraps the app and manages the JWT token
export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => sessionStorage.getItem('token'))

  // sync token to both react state and sessionStorage
  const setToken = (newToken) => {
    if (newToken) {
      sessionStorage.setItem('token', newToken)
    } else {
      sessionStorage.removeItem('token')
    }
    setTokenState(newToken)
  }

  // memoize to prevent unnecessary re-renders
  const value = useMemo(() => ({ token, setToken }), [token])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// hook to access auth state, throws if used outside AuthProvider
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
