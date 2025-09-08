<template>
  <transition name="toast-fade">
    <div
      v-show="message"
      class="toast"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      tabindex="0"
    >
      <slot>{{ message }}</slot>
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({
  message: String,
})
</script>

<style scoped>
/* === Toast Container === */

.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999; /* Ensure it's on top */
  background-color: #2f855a;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  font-weight: 600;
  font-size: 0.95rem;
  max-width: 360px;
  pointer-events: auto;
  user-select: none;
  line-height: 1.4;
  transition: box-shadow 0.3s ease;
  bottom:0;
}

/* Add subtle animation on show */
.toast:focus,
.toast:hover {
  box-shadow: 0 16px 28px rgba(0, 0, 0, 0.25);
}

/* === Animation: Fade In/Out === */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
