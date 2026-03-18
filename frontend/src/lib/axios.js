import axios from 'axios'

// configured axios instance, uses vite proxy by default
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

// attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
