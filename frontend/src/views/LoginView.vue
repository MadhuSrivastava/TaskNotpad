<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Login</h2>

      <form @submit.prevent="handleLogin" class="auth-form" novalidate>
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          required
          autocomplete="username"
          :class="{ invalid: error && email }"
          :disabled="loading"
        />

        <input
          v-model="password"
          type="password"
          placeholder="Password"
          required
          autocomplete="current-password"
          :class="{ invalid: error && password }"
          :disabled="loading"
        />

        <button :disabled="loading || !email || !password">
          <span v-if="loading">Logging in...</span>
          <span v-else>Login</span>
        </button>

        <p v-if="error" class="error-msg" role="alert">{{ error }}</p>
      </form>

      <p class="register-prompt">
        Don't have an account?
        <router-link to="/register" class="register-link">Register here</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const { email, password, loading, error, login, clear } = useAuth()

const handleLogin = async () => {
  const success = await login()
  if (success) {
    clear()
    router.push('/tasks')
  }
}
</script>

<style scoped>
.register-prompt {
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
  color: #555;
}

.register-link {
  color: #1976d2;
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.3rem;
  user-select: none;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #0d47a1;
  text-decoration: underline;
}

</style>
