// src/composables/useConfirmModal.js
import { ref } from 'vue'

/**
 * Composable for managing a confirm modal with promise-based API.
 * @returns {object} modal state and control methods
 */
export function useConfirmModal() {
  const isOpen = ref(false)
  const message = ref('')
  let resolvePromise = null

  /**
   * Opens the modal with the given message.
   * @param {string} confirmMessage - Message to show in the modal
   * @returns {Promise<boolean>} resolves to true if confirmed, false if canceled
   */
  const open = (confirmMessage) => {
    message.value = confirmMessage
    isOpen.value = true

    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  const confirm = () => {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
  }

  const cancel = () => {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
  }

  return {
    isOpen,
    message,
    open,
    confirm,
    cancel,
  }
}
