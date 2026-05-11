<script setup>
import { ref } from 'vue'
import { updateColumn, moveColumn, deleteColumn } from '../api/columns.js'

const props = defineProps({
  column: { type: Object, required: true },
  canMoveUp: { type: Boolean, default: false },
  canMoveDown: { type: Boolean, default: false }
})

const emit = defineEmits(['update', 'reorder', 'delete'])

// Editable title
const editingTitle = ref(false)
const draftTitle = ref('')
const colError = ref('')

function startEditTitle() {
  draftTitle.value = props.column.title
  editingTitle.value = true
}

async function commitTitle() {
  editingTitle.value = false
  const t = draftTitle.value.trim()
  if (!t || t === props.column.title) return
  colError.value = ''
  try {
    const updated = await updateColumn(props.column.id, { title: t })
    emit('update', updated)
  } catch (e) {
    colError.value = e.message
  }
}

// Move column up = target position is current position - 1.
// moveColumn returns { columns: [...] } — emit 'reorder' so BoardView can
// replace its state with the server-authoritative renumbered list.
async function moveUp() {
  colError.value = ''
  try {
    const { columns } = await moveColumn(props.column.id, props.column.position - 1)
    emit('reorder', columns)
  } catch (e) {
    colError.value = e.message
  }
}

async function moveDown() {
  colError.value = ''
  try {
    const { columns } = await moveColumn(props.column.id, props.column.position + 1)
    emit('reorder', columns)
  } catch (e) {
    colError.value = e.message
  }
}

async function remove() {
  if (!confirm(`Delete column "${props.column.title}"?`)) return
  colError.value = ''
  try {
    await deleteColumn(props.column.id)
    emit('delete', props.column.id)
  } catch (e) {
    // 409 = column has cards; surface a readable message
    colError.value = e.message
  }
}
</script>

<template>
  <div class="column">
    <div class="col-header">
      <template v-if="editingTitle">
        <input
          class="col-title-input"
          v-model="draftTitle"
          type="text"
          maxlength="40"
          @blur="commitTitle"
          @keydown.enter="commitTitle"
          @keydown.esc="editingTitle = false"
          autofocus
        />
      </template>
      <span v-else class="col-title" @click="startEditTitle" title="Click to rename">
        {{ column.title }}
      </span>

      <div class="col-actions">
        <button
          class="ghost icon-btn"
          type="button"
          :disabled="!canMoveUp"
          title="Move left"
          @click="moveUp"
        >↑</button>
        <button
          class="ghost icon-btn"
          type="button"
          :disabled="!canMoveDown"
          title="Move right"
          @click="moveDown"
        >↓</button>
        <button
          class="ghost icon-btn delete-btn"
          type="button"
          title="Delete column"
          @click="remove"
        >✕</button>
      </div>
    </div>

    <p v-if="colError" class="col-error">{{ colError }}</p>

    <div class="cards-placeholder">No cards yet</div>
  </div>
</template>

<style scoped>
.column {
  flex-shrink: 0;
  width: 240px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.col-header {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 2rem;
}

.col-title {
  flex: 1;
  font-weight: 600;
  font-size: 0.9rem;
  color: #374151;
  cursor: pointer;
  border-bottom: 2px dashed transparent;
  padding-bottom: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-title:hover {
  border-bottom-color: #a5b4fc;
}

.col-title-input {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid #6366f1;
  outline: none;
  color: #374151;
  background: transparent;
  padding: 0 0 1px;
  min-width: 0;
}

.col-actions {
  display: flex;
  gap: 0.1rem;
  flex-shrink: 0;
}

.icon-btn {
  font-size: 0.75rem;
  padding: 0.2rem 0.3rem;
  color: #9ca3af;
  line-height: 1;
}

.icon-btn:disabled {
  opacity: 0.3;
  cursor: default;
  background: transparent;
}

.icon-btn:not(:disabled):hover {
  color: #4f46e5;
}

.delete-btn:not(:disabled):hover {
  color: #ef4444;
}

.col-error {
  color: #ef4444;
  font-size: 0.78rem;
  margin: 0;
}

.cards-placeholder {
  color: #9ca3af;
  font-size: 0.82rem;
  text-align: center;
  padding: 1.5rem 0;
  border: 1px dashed #e5e7eb;
  border-radius: 8px;
}
</style>
