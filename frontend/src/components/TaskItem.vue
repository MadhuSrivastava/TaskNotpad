<template>
  <li class="task-item" :aria-busy="isUpdating || isDeleting">
    <input
      v-if="isEditing"
      v-model="editTitle"
      @keyup.enter="saveEdit"
      @keyup.esc="cancelEdit"
      :disabled="isUpdating"
      class="task-edit"
      aria-label="Edit task title"
      ref="editInput"
    />
    <span v-else @dblclick="startEdit" tabindex="0" role="textbox" aria-readonly="true" @keydown.enter.prevent="startEdit">
      {{ task.title }}
    </span>

    <button
      class="delete-btn"
      :disabled="isDeleting"
      @click="onDeleteClick"
      aria-label="Delete task"
    >
      <span v-if="isDeleting" class="spinner" aria-hidden="true"></span>
      <span v-else>Delete</span>
    </button>

    <button
      v-if="isEditing"
      :disabled="isUpdating"
      @click="saveEdit"
      aria-label="Save task"
    >
      <span v-if="isUpdating" class="spinner" aria-hidden="true"></span>
      <span v-else>Save</span>
    </button>

    <button
      v-if="isEditing"
      :disabled="isUpdating"
      @click="cancelEdit"
      aria-label="Cancel editing"
    >
      Cancel
    </button>

    <ConfirmationModal
      :isOpen="confirmModal.isOpen"
      :message="confirmModal.message"
      :confirm="confirmModal.confirm"
      :cancel="confirmModal.cancel"
    />
  </li>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useConfirmModal } from '../composables/useConfirmModal'
import ConfirmationModal from './ConfirmationModal.vue'

const props = defineProps({
  task: Object,
})

const emit = defineEmits(['update-task', 'delete-task'])

const editTitle = ref(props.task.title)
const isEditing = ref(false)
const isUpdating = ref(false)
const isDeleting = ref(false)

const confirmModal = useConfirmModal()

function startEdit() {
  isEditing.value = true
  editTitle.value = props.task.title
  nextTick(() => {
    editInput.value?.focus()
  })
}

function cancelEdit() {
  editTitle.value = props.task.title
  isEditing.value = false
}

async function saveEdit() {
  if (editTitle.value.trim() === '') {
    alert('Task cannot be empty')
    return
  }
  if (editTitle.value.trim() === props.task.title) {
    isEditing.value = false
    return
  }

  isUpdating.value = true
  try {
    await emit('update-task', { ...props.task, title: editTitle.value.trim() })
    isEditing.value = false
  } finally {
    isUpdating.value = false
  }
}

async function onDeleteClick() {
  const confirmed = await confirmModal.open('Are you sure you want to delete this task?')
  if (confirmed) {
    isDeleting.value = true
    try {
      await emit('delete-task', props.task.id)
    } finally {
      isDeleting.value = false
    }
  }
}

const editInput = ref(null)
onMounted(() => {
  if (isEditing.value) {
    editInput.value?.focus()
  }
})
</script>

<style scoped>
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
</style>
