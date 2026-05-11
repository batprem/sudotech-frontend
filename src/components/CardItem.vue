<script setup>
defineProps({ card: { type: Object, required: true } })
defineEmits(['edit'])
</script>

<template>
  <div class="card-item" @click="$emit('edit', card)" role="button" tabindex="0" @keydown.enter="$emit('edit', card)">
    <span class="card-title">{{ card.title }}</span>
  </div>
</template>

<style scoped>
.card-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  font-size: 0.88rem;
  color: #374151;
  transition: box-shadow 0.15s, border-color 0.15s, transform 0.1s;
  word-break: break-word;
}

.card-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-color: #c7d2fe;
  transform: translateY(-1px);
}

.card-item:active {
  transform: translateY(0);
}

.card-title {
  display: block;
  line-height: 1.4;
}
</style>
