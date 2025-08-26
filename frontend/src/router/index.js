import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import TaskList from '../views/TaskList.vue'

const routes = [
  { path: '/', redirect: '/tasks' },
  { path: '/tasks', name: 'Tasks', component: TaskList, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  { path: '/:catchAll(.*)', redirect: '/tasks' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next({ name: 'Login' })
  }

  if ((to.name === 'Login' || to.name === 'Register') && authStore.isLoggedIn) {
    return next({ name: 'Tasks' })
  }

  next()
})

export default router
