<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="isOpen"
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        @keydown.esc.prevent="$emit('cancel')"
        @click.self="$emit('cancel')"
      >
        <div class="modal-content" ref="modalRef" tabindex="-1">
          <h2 id="modal-title" class="modal-title">Confirm Action</h2>
          <p class="modal-message">{{ message }}</p>
          <div class="modal-actions">
            <button class="btn btn-confirm" @click="$emit('confirm')">Yes, Delete</button>
            <button class="btn btn-cancel" @click="$emit('cancel')">Cancel</button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  message: String,
})

const modalRef = ref(null)

watch(
  () => props.isOpen,
  async (val) => {
    if (val) {
      await nextTick()
      modalRef.value?.focus()
    }
  }
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  color: #222;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s ease;
  outline: none;
  text-align: center;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.modal-message {
  font-size: 1rem;
  margin-bottom: 2rem;
  color: #444;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  font-size: 1rem;
  padding: 0.65rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-confirm {
  background-color: #e63946;
  color: white;
}
.btn-confirm:hover {
  background-color: #c72c3b;
}

.btn-cancel {
  background-color: #eee;
  color: #444;
}
.btn-cancel:hover {
  background-color: #ddd;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
@media (prefers-color-scheme: dark) {
  .modal-content {
    background: #1f1f1f;
    color: #eee;
  }

  .btn-cancel {
    background-color: #333;
    color: #ccc;
  }

  .btn-cancel:hover {
    background-color: #444;
  }
}
</style>
