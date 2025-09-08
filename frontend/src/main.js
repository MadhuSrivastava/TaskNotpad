import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
// import reusable auth styles globally
import './assets/auth.css'

createApp(App).use(router).use(createPinia()).mount('#app')
