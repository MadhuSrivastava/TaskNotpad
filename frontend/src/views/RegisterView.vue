<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Register</h2>
      <form @submit.prevent="handleRegister" class="auth-form" novalidate>
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          required
          autocomplete="email"
          :disabled="loading"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          required
          autocomplete="new-password"
          :disabled="loading"
        />
        <button :disabled="loading">
          <span v-if="loading">Registering...</span>
          <span v-else>Register</span>
        </button>
        <p v-if="error" class="error-msg" role="alert">{{ error }}</p>
      </form>
    </div>

    <!-- Toast message -->
    <ToastMessage :message="toastMessage" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useRouter } from 'vue-router'
import ToastMessage from '../components/ToastMessage.vue' // create this component as shown earlier

const router = useRouter()
const { email, password, loading, error, register, clear } = useAuth()

const toastMessage = ref('')

const handleRegister = async () => {
  const success = await register()
  if (success) {
    toastMessage.value = 'Registered successfully! Redirecting to login...'
    clear()
    setTimeout(() => {
      toastMessage.value = ''
      router.push('/login')
    }, 2000)
  }
}
</script>
