const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || ''

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '')

export const apiUrl = (path) => {
  if (!path.startsWith('/')) {
    throw new Error(`API path must start with "/": ${path}`)
  }

  return API_BASE_URL ? `${API_BASE_URL}${path}` : path
}
