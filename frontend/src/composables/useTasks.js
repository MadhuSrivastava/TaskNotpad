import { ref, watch, nextTick } from 'vue'
import * as taskService from '../services/taskService'  // Import all service functions

export function useTasks() {
  const tasks = ref([])
  const newTask = ref('')
  const loading = ref(false)
  const adding = ref(false)
  const deletingId = ref(null)
  const updatingId = ref(null)
  const error = ref(null)
  const errorRef = ref(null)

  const originalTitles = new Map()

  const setError = (msg) => { error.value = msg }
  const clearError = () => { error.value = null }

  const loadTasks = async () => {
    loading.value = true
    clearError()
    try {
      const res = await taskService.getTasks()  // Use service function here
      tasks.value = res.data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks')
    } finally {
      loading.value = false
    }
  }

  const addTask = async () => {
    const title = newTask.value.trim()
    if (!title) return

    if (tasks.value.some(t => t.title.trim().toLowerCase() === title.toLowerCase())) {
      setError('Task already exists!')
      return
    }

    adding.value = true
    clearError()
    try {
      const res = await taskService.createTask(title)  // Use service here
      tasks.value.push(res.data)
      newTask.value = ''
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task')
    } finally {
      adding.value = false
    }
  }

  const startEdit = (task) => {
    originalTitles.set(task.id, task.title)
    clearError()
  }

  const cancelEdit = (task) => {
    if (originalTitles.has(task.id)) {
      task.title = originalTitles.get(task.id)
      originalTitles.delete(task.id)
      clearError()
    }
  }

  const updateTask = async (task) => {
    const trimmedTitle = task.title.trim()
    const originalTitle = originalTitles.get(task.id) ?? task.title

    if (!trimmedTitle) {
      setError('Task cannot be empty!')
      task.title = originalTitle
      originalTitles.delete(task.id)
      return
    }

    if (
      tasks.value.some(
        t => t.id !== task.id && t.title.trim().toLowerCase() === trimmedTitle.toLowerCase()
      )
    ) {
      setError('Task with this title already exists!')
      task.title = originalTitle
      originalTitles.delete(task.id)
      return
    }

    updatingId.value = task.id
    clearError()
    try {
      await taskService.updateTask(task.id, { title: trimmedTitle })  // Use service here
      originalTitles.set(task.id, trimmedTitle)
      task.title = trimmedTitle
    } catch (err) {
      task.title = originalTitle
      setError(err.response?.data?.message || 'Failed to update task')
    } finally {
      updatingId.value = null
    }
  }

  const deleteTask = async (id) => {
    deletingId.value = id
    clearError()
    try {
      await taskService.deleteTask(id)  // Use service here
      tasks.value = tasks.value.filter(t => t.id !== id)
      originalTitles.delete(id)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task')
    } finally {
      deletingId.value = null
    }
  }

  const confirmDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id)
    }
  }

  watch(error, async (msg) => {
    if (msg && errorRef.value) {
      await nextTick()
      errorRef.value.focus()
      setTimeout(() => {
        if (error.value === msg) clearError()
      }, 4000)
    }
  })

  return {
    tasks,
    newTask,
    loading,
    adding,
    deletingId,
    updatingId,
    error,
    errorRef,
    loadTasks,
    addTask,
    startEdit,
    cancelEdit,
    updateTask,
    confirmDelete,
  }
}
