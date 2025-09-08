<template> 
  <div class="tasks-container" role="main" aria-labelledby="tasks-title">
    <h2 id="tasks-title">My Tasks</h2>

    <form @submit.prevent="addTask" class="task-form" aria-label="Add new task">
      <input
        v-model="newTask"
        placeholder="New task"
        required
        :disabled="adding"
        aria-required="true"
        aria-describedby="error-msg"
        @input="clearError"
      />
      <button
        type="submit"
        :disabled="adding || !newTask.trim()"
        aria-live="polite"
        :aria-busy="adding.toString()"
      >
        <span v-if="adding">
          <span class="spinner" aria-hidden="true"></span>
          <span class="sr-only">Adding...</span>
        </span>
        <span v-else>Add</span>
      </button>
    </form>

    <p
      v-if="error"
      id="error-msg"
      class="error-msg"
      role="alert"
      tabindex="-1"
      ref="errorRef"
    >
      {{ error }}
    </p>

    <p v-if="loading" class="loading-msg" aria-live="polite" aria-busy="true">
      Loading tasks...
    </p>

    <transition-group
      name="fade"
      tag="ul"
      class="task-list"
      v-if="tasks.length && !loading"
      aria-live="polite"
    >
      <li
        v-for="task in tasks"
        :key="task.id"
        class="task-item"
        :aria-label="`Task: ${task.title}`"
      >
        <input
          type="text"
          v-model="task.title"
          class="task-edit"
          :disabled="taskUpdatingId === task.id || deletingId === task.id"
          @focus="startEdit(task)"
          @blur="onBlurUpdate(task)"
          @keyup.enter.prevent="onEnterUpdate(task)"
          @keyup.esc.prevent="cancelEdit(task)"
          :aria-label="`Edit task: ${task.title}`"
          :aria-describedby="`edit-desc-${task.id}`"
        />
        <span class="sr-only" :id="`edit-desc-${task.id}`">
          Press Enter to save, Escape to cancel.
        </span>
        <button
          class="delete-btn"
          @click="confirmDelete(task.id)"
          :disabled="deletingId === task.id || taskUpdatingId === task.id"
          :aria-label="`Delete task: ${task.title}`"
        >
          <span v-if="deletingId === task.id">
            <span class="spinner" aria-hidden="true"></span>
            <span class="sr-only">Deleting...</span>
          </span>
          <span v-else>Delete</span>
        </button>
      </li>
    </transition-group>

    <p v-if="!tasks.length && !loading" class="empty-msg" aria-live="polite">
      No tasks yet. Add one!
    </p>

    <ConfirmationModal
      :isOpen="isOpen"
      :message="message"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
  <ToastMessage :message="toastMsg" />
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import api from '../utils/axios'
import ConfirmationModal from '../components/ConfirmationModal.vue'
import ToastMessage from '../components/ToastMessage.vue'

const toastMsg = ref('')
let toastTimeout = null
const showToast = (message) => {
  toastMsg.value = message
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    toastMsg.value = ''
  }, 4000)
}

function useConfirmModal() {
  const isOpen = ref(false)
  const message = ref('')
  let resolvePromise = null

  const open = (msg) => {
    message.value = msg
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

  return { isOpen, message, open, confirm, cancel }
}

const tasks = ref([])
const newTask = ref('')
const loading = ref(false)
const adding = ref(false)
const deletingId = ref(null)
const taskUpdatingId = ref(null)
const editingId = ref(null)
const error = ref(null)
const errorRef = ref(null)
const originalTitles = new Map()

const { isOpen, message, open, confirm, cancel } = useConfirmModal()

const loadTasks = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await api.get('/tasks')
    tasks.value = res.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load tasks'
  } finally {
    loading.value = false
  }
}

const clearError = () => {
  if (error.value) error.value = null
}

const addTask = async () => {
  const title = newTask.value.trim()
  if (!title) return

  if (tasks.value.some(t => t.title.trim().toLowerCase() === title.toLowerCase())) {
    error.value = 'Task already exists!'
    return
  }

  adding.value = true
  error.value = null
  try {
    const res = await api.post('/tasks', { title })
    tasks.value.push(res.data)
    newTask.value = ''
    showToast('Task added successfully!')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to add task'
  } finally {
    adding.value = false
  }
}

const startEdit = (task) => {
  originalTitles.set(task.id, task.title)
  error.value = null
  editingId.value = task.id
}

const cancelEdit = (task) => {
  if (originalTitles.has(task.id)) {
    task.title = originalTitles.get(task.id)
    originalTitles.delete(task.id)
    error.value = null
  }
  editingId.value = null
}

const onBlurUpdate = (task) => {
  if (editingId.value === task.id) {
    updateTask(task)
  }
}

const onEnterUpdate = (task) => {
  if (editingId.value === task.id) {
    updateTask(task)
  }
}

const updateTask = async (task) => {
  const trimmedTitle = task.title.trim()
  const originalTitle = originalTitles.get(task.id) || task.title

  if (!trimmedTitle) {
    error.value = 'Task cannot be empty!'
    task.title = originalTitle
    originalTitles.delete(task.id)
    return
  }

  if (
    tasks.value.some(
      t => t.id !== task.id && t.title.trim().toLowerCase() === trimmedTitle.toLowerCase()
    )
  ) {
    error.value = 'Task with this title already exists!'
    task.title = originalTitle
    originalTitles.delete(task.id)
    return
  }

  taskUpdatingId.value = task.id
  error.value = null

  try {
    await api.put(`/tasks/${task.id}`, { title: trimmedTitle })
    originalTitles.set(task.id, trimmedTitle)
    task.title = trimmedTitle
    showToast('Task updated successfully!')
  } catch (err) {
    task.title = originalTitle
    error.value = err.response?.data?.message || 'Failed to update task'
  } finally {
    taskUpdatingId.value = null
    editingId.value = null
  }
}

const deleteTask = async (id) => {
  deletingId.value = id
  error.value = null
  try {
    await api.delete(`/tasks/${id}`)
    tasks.value = tasks.value.filter(t => t.id !== id)
    originalTitles.delete(id)
    showToast('Task deleted successfully!')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete task'
  } finally {
    deletingId.value = null
  }
}

const confirmDelete = async (id) => {
  const confirmed = await open('Are you sure you want to delete this task?')
  if (confirmed) {
    deleteTask(id)
  }
}

const handleConfirm = () => confirm()
const handleCancel = () => cancel()

watch(error, async (val) => {
  if (val) {
    showToast(val)
    if (errorRef.value) {
      await nextTick()
      errorRef.value.focus()
    }
    setTimeout(() => {
      error.value = null
    }, 4000)
  }
})

onMounted(loadTasks)
</script>

<style scoped>
.tasks-container {
  max-width: 480px;
  margin: 2rem auto;
  padding: 1rem 2rem 2rem;
  background: rgba(255 255 255 / 0.95);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(8px);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #222;
  font-weight: 700;
}

/* Form Styles */
.task-form {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.task-form input {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 1.5px solid #ccc;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.task-form input:focus {
  outline: none;
  border-color: #0077ff;
  box-shadow: 0 0 8px rgba(0, 119, 255, 0.3);
}

.task-form button {
  padding: 0.75rem 1.75rem;
  font-weight: 700;
  background-color: #0077ff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  user-select: none;
}

.task-form button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.task-form button:hover:not(:disabled) {
  background-color: #005fcc;
}

/* Error & Loading messages */
.error-msg {
  color: #e63946;
  text-align: center;
  margin-bottom: 1rem;
  outline: none;
}

.loading-msg {
  text-align: center;
  margin-bottom: 1rem;
  color: #555;
  font-style: italic;
}

/* Task list */
.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  background: #f6f9ff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.05);
  transition: background-color 0.2s, box-shadow 0.3s;
}

.task-item:hover {
  background-color: #e3f2fd;
  box-shadow: 0 3px 12px rgb(0 0 0 / 0.12);
}

/* Editable input */
.task-edit {
  flex-grow: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  padding: 0.3rem 0.5rem;
  color: #222;
  cursor: text;
}

.task-edit:disabled {
  cursor: wait;
  color: #999;
}

/* Delete button */
.delete-btn {
  margin-left: 1rem;
  background: #e63946;
  border: none;
  color: white;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  user-select: none;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.delete-btn:hover:not(:disabled) {
  background-color: #b62d39;
}

/* Spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Fade transition for task list */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Empty state */
.empty-msg {
  text-align: center;
  margin-top: 2rem;
  color: #666;
  font-style: italic;
}
.sr-only {
position: absolute !important;
width: 1px !important;
height: 1px !important;
padding: 0 !important;
margin: -1px !important;
overflow: hidden !important;
clip: rect(0, 0, 0, 0) !important;
border: 0 !important;
}
</style>
