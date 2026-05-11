<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getBoard, updateBoard } from '../api/boards.js'
import { createColumn } from '../api/columns.js'
import BoardColumn from '../components/BoardColumn.vue'

const props = defineProps({ boardId: Number })
const emit = defineEmits(['back'])

const state = reactive({ board: null, columns: [] })
const loading = ref(true)
const error = ref('')

// Editable board title
const editingTitle = ref(false)
const draftTitle = ref('')

// Add-column inline form
const newColTitle = ref('')
const addingCol = ref(false)
const addColError = ref('')

onMounted(async () => {
  await loadBoard()
})

async function loadBoard() {
  loading.value = true
  error.value = ''
  try {
    const data = await getBoard(props.boardId)
    state.board = data.board
    // Sort columns by position (server should already return sorted, but be safe)
    state.columns = [...data.columns].sort((a, b) => a.position - b.position)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function startEditTitle() {
  draftTitle.value = state.board.title
  editingTitle.value = true
}

async function commitTitle() {
  editingTitle.value = false
  const t = draftTitle.value.trim()
  if (!t || t === state.board.title) return
  try {
    const updated = await updateBoard(props.boardId, { title: t })
    state.board = updated
  } catch (e) {
    error.value = e.message
  }
}

async function addColumn() {
  const title = newColTitle.value.trim()
  if (!title || addingCol.value) return
  addColError.value = ''
  addingCol.value = true
  try {
    const col = await createColumn(props.boardId, title)
    state.columns.push(col)
    newColTitle.value = ''
  } catch (e) {
    addColError.value = e.message
  } finally {
    addingCol.value = false
  }
}

// Called by BoardColumn when it gets back the full renumbered list from moveColumn.
// The move endpoint returns { columns: [...] } — we accept that authoritative list directly
// rather than a local splice, so position values stay in sync with the server.
function onColumnsReordered(columns) {
  state.columns = [...columns].sort((a, b) => a.position - b.position)
}

function onColumnUpdated(updatedCol) {
  const idx = state.columns.findIndex(c => c.id === updatedCol.id)
  if (idx !== -1) state.columns[idx] = updatedCol
}

function onColumnDeleted(colId) {
  state.columns = state.columns.filter(c => c.id !== colId)
}
</script>

<template>
  <div class="board-view">
    <div v-if="loading" class="board-loading">Loading board…</div>

    <template v-else-if="state.board">
      <div class="board-header">
        <button class="ghost back-btn" type="button" @click="$emit('back')">← Back</button>

        <template v-if="editingTitle">
          <input
            class="title-input"
            v-model="draftTitle"
            type="text"
            maxlength="80"
            @blur="commitTitle"
            @keydown.enter="commitTitle"
            @keydown.esc="editingTitle = false"
            autofocus
          />
        </template>
        <h2 v-else class="board-title" @click="startEditTitle" title="Click to rename">
          {{ state.board.title }}
        </h2>
      </div>

      <p v-if="error" class="board-error">{{ error }}</p>

      <div class="columns-strip">
        <BoardColumn
          v-for="(col, idx) in state.columns"
          :key="col.id"
          :column="col"
          :can-move-up="idx > 0"
          :can-move-down="idx < state.columns.length - 1"
          @update="onColumnUpdated"
          @reorder="onColumnsReordered"
          @delete="onColumnDeleted"
        />

        <div class="add-column-panel">
          <form @submit.prevent="addColumn">
            <input
              v-model="newColTitle"
              type="text"
              placeholder="Column title…"
              maxlength="40"
              :disabled="addingCol"
            />
            <button type="submit" :disabled="addingCol || !newColTitle.trim()">Add column</button>
          </form>
          <p v-if="addColError" class="col-error">{{ addColError }}</p>
        </div>
      </div>
    </template>

    <p v-else class="board-error">{{ error }}</p>
  </div>
</template>

<style scoped>
.board-view {
  width: 100%;
}

.board-loading {
  color: #9ca3af;
  padding: 2rem 0;
  text-align: center;
}

.board-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.back-btn {
  color: #6b7280;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.back-btn:hover { color: #4f46e5; }

.board-title {
  margin: 0;
  font-size: 1.35rem;
  color: #1f2937;
  cursor: pointer;
  border-bottom: 2px dashed transparent;
  padding-bottom: 2px;
}

.board-title:hover {
  border-bottom-color: #a5b4fc;
}

.title-input {
  font-size: 1.35rem;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid #6366f1;
  outline: none;
  color: #1f2937;
  padding: 0 0 2px;
  background: transparent;
  min-width: 10rem;
}

.board-error {
  color: #ef4444;
  font-size: 0.9rem;
  margin: 0 0 1rem;
}

.columns-strip {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.add-column-panel {
  flex-shrink: 0;
  width: 220px;
  background: #f1f5f9;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.add-column-panel form {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.add-column-panel input {
  padding: 0.5rem 0.6rem;
  font-size: 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

.add-column-panel input:focus {
  outline: 2px solid #6366f1;
  outline-offset: 1px;
}

.add-column-panel button {
  font-size: 0.85rem;
  padding: 0.45rem 0.7rem;
}

.col-error {
  color: #ef4444;
  font-size: 0.8rem;
  margin: 0;
}
</style>
