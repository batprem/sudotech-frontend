<script setup>
import { ref, onMounted } from 'vue'
import { listBoards, createBoard, deleteBoard } from '../api/boards.js'

const emit = defineEmits(['open'])

const boards = ref([])
const newTitle = ref('')
const formError = ref('')
const deleteError = ref('')
const busy = ref(false)
const loading = ref(true)
const loadError = ref('')

onMounted(async () => {
  try {
    boards.value = await listBoards()
  } catch (e) {
    loadError.value = e.message
  } finally {
    loading.value = false
  }
})

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

async function addBoard() {
  const title = newTitle.value.trim()
  if (busy.value) return
  if (!title) { formError.value = 'Title is required.'; return }
  if (title.length > 80) { formError.value = 'Title must be 80 characters or fewer.'; return }
  formError.value = ''
  deleteError.value = ''
  busy.value = true
  try {
    const board = await createBoard(title)
    boards.value.unshift(board)
    newTitle.value = ''
    emit('open', board.id)
  } catch (e) {
    formError.value = e.message
  } finally {
    busy.value = false
  }
}

async function removeBoard(board) {
  if (!window.confirm(`Delete board "${board.title}"?`)) return
  deleteError.value = ''
  try {
    await deleteBoard(board.id)
    boards.value.splice(boards.value.indexOf(board), 1)
  } catch (e) {
    deleteError.value = e.message
    try { boards.value = await listBoards() } catch (_) { /* keep existing list */ }
  }
}
</script>

<template>
  <div class="boards-wrap">
    <form class="new-board-form" @submit.prevent="addBoard">
      <div class="new-board-row">
        <input
          v-model="newTitle"
          type="text"
          placeholder="New board title…"
          :disabled="busy"
          maxlength="80"
        />
        <button type="submit" :disabled="busy">Add board</button>
      </div>
      <p v-if="formError" class="form-error">{{ formError }}</p>
    </form>

    <p v-if="loading" class="boards-loading">Loading…</p>

    <p v-if="loadError" class="boards-error">{{ loadError }}</p>

    <p v-if="deleteError" class="boards-error">{{ deleteError }}</p>

    <div v-if="!loading && boards.length > 0" class="boards-grid">
      <div
        v-for="board in boards"
        :key="board.id"
        class="board-card"
        @click="$emit('open', board.id)"
      >
        <span class="board-card-title">{{ board.title }}</span>
        <span class="board-card-time">edited {{ relativeTime(board.updated_at) }}</span>
        <button
          class="ghost board-card-delete"
          type="button"
          title="Delete board"
          @click.stop="removeBoard(board)"
        >✕</button>
      </div>
    </div>

    <p v-if="!loading && boards.length === 0 && !loadError" class="boards-empty">
      No boards yet — create your first one above.
    </p>
  </div>
</template>

<style scoped>
.boards-wrap {
  width: 100%;
}

.boards-loading,
.boards-empty {
  color: #9ca3af;
  text-align: center;
  padding: 2rem 0;
}

.boards-error {
  color: #ef4444;
  margin: 0 0 1rem;
  font-size: 0.9rem;
}

.boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.board-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem 1rem 0.75rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  position: relative;
  transition: box-shadow 0.15s, border-color 0.15s;
  min-height: 80px;
}

.board-card:hover {
  border-color: #a5b4fc;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.12);
}

.board-card-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1f2937;
  padding-right: 1.5rem;
}

.board-card-time {
  font-size: 0.78rem;
  color: #9ca3af;
}

.board-card-delete {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.75rem;
  color: #d1d5db;
  padding: 0.2rem 0.35rem;
}

.board-card-delete:hover {
  color: #ef4444;
}

.new-board-form {
  margin-bottom: 1.5rem;
}

.new-board-row {
  display: flex;
  gap: 0.5rem;
}

.new-board-form input {
  flex: 1;
  padding: 0.6rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

.new-board-form input:focus {
  outline: 2px solid #6366f1;
  outline-offset: 1px;
}

.form-error {
  color: #ef4444;
  font-size: 0.85rem;
  margin: 0.35rem 0 0;
}
</style>
