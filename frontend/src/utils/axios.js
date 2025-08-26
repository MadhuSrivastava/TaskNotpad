import axios from 'axios'
import router from '../router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const currentPath = router.currentRoute.value.path

    if ((status === 401 || status === 403) && currentPath !== '/login') {
      localStorage.removeItem('token')
      alert('Your session has expired. Please log in again.')
      router.push('/login')
    }

    if (status === 500) {
      console.error('Server error:', error.response?.data?.message || 'Internal server error')
    }

    return Promise.reject(error)
  }
)

export default api
