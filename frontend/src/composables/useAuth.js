import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import * as authService from '../services/auth.service' // <-- import auth services

export function useAuth() {
  const email = ref('')
  const password = ref('')
  const loading = ref(false)
  const error = ref('')
  const router = useRouter()
  const authStore = useAuthStore()

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const strongPasswordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{6,}$/

  const validate = () => {
    if (!email.value || !password.value) {
      error.value = 'Email and password are required.'
      return false
    }

    if (!emailPattern.test(email.value)) {
      error.value = 'Please enter a valid email address.'
      return false
    }

    if (!strongPasswordPattern.test(password.value)) {
      error.value =
        'Password must be at least 6 characters long and include at least one uppercase letter, one number, and one special character (e.g. !, @, #).'
      return false
    }

    error.value = ''
    return true
  }

  async function submitAuth(action) {
    if (!validate()) return false

    loading.value = true
    error.value = ''

    try {
      let data

      if (action === 'login') {
        const response = await authService.login(email.value, password.value)
        data = response.data
        authStore.setToken(data.token)
        // Optionally fetch user info or set user here
        authStore.setUser(data.user || { email: email.value })
      } else if (action === 'register') {
        await authService.register(email.value, password.value)
      }

      return true
    } catch (e) {
      error.value = e?.response?.data?.message ?? `${action.charAt(0).toUpperCase() + action.slice(1)} failed.`
      return false
    } finally {
      loading.value = false
    }
  }

  const login = () => submitAuth('login')
  const register = () => submitAuth('register')

  const clear = () => {
    email.value = ''
    password.value = ''
    error.value = ''
  }

  return {
    email,
    password,
    loading,
    error,
    login,
    register,
    clear,
    isLoggedIn: authStore.isLoggedIn,
    logout: authStore.logout,
    user: authStore.user,
  }
}
