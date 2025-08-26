<template>
  <header>
    <nav class="container">
      <div class="logo">
        <router-link to="/">📝 MyTasks</router-link>
      </div>

      <button class="nav-toggle-button" @click="toggleMenu">
        <span :class="{ open: menuOpen }"></span>
      </button>

      <ul class="nav-links" :class="{ open: menuOpen }">
        <li>
          <router-link to="/" @click="closeMenu" exact-active-class="active">Tasks</router-link>
        </li>

        <li v-if="!auth.isLoggedIn">
          <router-link to="/login" @click="closeMenu">Login</router-link>
        </li>

        <li v-else class="profile-wrapper">
          <div class="avatar" @click="toggleProfileMenu">
            👤
          </div>
          <ul v-if="profileMenuOpen" class="profile-menu">
            <li class="profile-email">{{ auth.user.email }}</li>
            <li><button class="logout-btn" @click="handleLogout">Logout</button></li>
          </ul>
        </li>
      </ul>
    </nav>
  </header>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const menuOpen = ref(false)
const profileMenuOpen = ref(false)

const auth = useAuthStore()

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
  profileMenuOpen.value = false
}

const handleLogout = () => {
  auth.logout()
  closeMenu()
  router.push('/login')
}

const toggleProfileMenu = () => {
  profileMenuOpen.value = !profileMenuOpen.value
}
</script>

<style scoped>
.profile-wrapper {
  position: relative;
}

.avatar {
  font-size: 1.4rem;
  cursor: pointer;
  background-color: #1976d2;
  color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: background-color 0.3s;
}
.avatar:hover {
  background-color: #0d47a1;
}

.profile-menu {
  position: absolute;
  right: 0;
  top: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 0.5rem 0;
  list-style: none;
  min-width: 160px;
  z-index: 1000;
}

.profile-menu li {
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.profile-menu li:last-child {
  border-bottom: none;
}

.profile-email {
  color: #555;
  font-weight: 500;
  pointer-events: none;
}

.logout-btn {
  background: none;
  border: none;
  color: #d32f2f;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.logout-btn:hover {
  background-color: #fce4ec;
}



/* Container styling */
nav.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  flex-wrap: wrap;
  background: linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%);
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Logo styling */
.logo a {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0d47a1;
  text-decoration: none;
  user-select: none;
  transition: color 0.3s ease;
}
.logo a:hover {
  color: #1976d2;
}

/* Navigation links container */
.nav-links {
  list-style: none;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  margin: 0;
  padding: 0;
}

/* Each nav item */
.nav-links li {
  display: inline-block;
}

/* Router links */
.nav-links a {
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  color: #1565c0;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: background-color 0.3s, color 0.3s;
  user-select: none;
}

.nav-links a:hover,
.nav-links a.active {
  background-color: #1976d2;
  color: white;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
}

/* Logout button styled like links */
.logout-btn {
  background: #1976d2;
  border: none;
  color: white;
  font-weight: 600;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.25s ease;
  user-select: none;
}

.logout-btn:hover {
  background-color: #0d47a1;
  box-shadow: 0 6px 15px rgba(13, 71, 161, 0.5);
}

/* Hamburger toggle button */
.nav-toggle-button {
  display: none;
  position: relative;
  width: 28px;
  height: 22px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  user-select: none;
  color: #1565c0;
  transition: color 0.3s ease;
}

.nav-toggle-button:hover {
  color: #1976d2;
}

/* Hamburger bars */
.nav-toggle-button span,
.nav-toggle-button span::before,
.nav-toggle-button span::after {
  display: block;
  background-color: currentColor;
  position: absolute;
  height: 3px;
  width: 100%;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.nav-toggle-button span {
  top: 50%;
  transform: translateY(-50%);
}

.nav-toggle-button span::before {
  content: '';
  top: -8px;
}

.nav-toggle-button span::after {
  content: '';
  top: 8px;
}

/* Animate hamburger into X when open */
.nav-toggle-button span.open {
  background-color: transparent;
}

.nav-toggle-button span.open::before {
  transform: rotate(45deg);
  top: 0;
}

.nav-toggle-button span.open::after {
  transform: rotate(-45deg);
  top: 0;
}

/* Responsive hamburger menu for small screens */
@media (max-width: 600px) {
  .nav-toggle-button {
    display: block;
  }

  .nav-links {
    width: 100%;
    flex-direction: column;
    display: none;
    margin-top: 1rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 10px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    padding: 1rem 0;
    backdrop-filter: blur(6px);
  }

  .nav-links.open {
    display: flex;
  }

  .nav-links li {
    margin-bottom: 0.75rem;
    text-align: center;
  }

  .nav-links a,
  .logout-btn {
    width: 100%;
    display: block;
    padding: 0.75rem 0;
    font-size: 1.1rem;
    border-radius: 0;
    box-shadow: none;
  }

  .logout-btn:hover,
  .nav-links a:hover,
  .nav-links a.active {
    box-shadow: none;
    background-color: #1976d2;
    color: white;
  }
}
</style>
