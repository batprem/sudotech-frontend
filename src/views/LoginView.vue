<script setup>
import { ref } from 'vue'
import { login } from '../api/auth.js'
import { auth } from '../auth/store.js'

defineEmits(['go-register'])

const username = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function submit() {
  if (!username.value || !password.value || busy.value) return
  error.value = ''
  busy.value = true
  try {
    const { token, user } = await login(username.value.trim(), password.value)
    auth.setSession(token, user)
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="card auth-card">
    <h2>Sign in</h2>
    <form class="auth-form" @submit.prevent="submit">
      <label>
        Username
        <input v-model="username" type="text" autocomplete="username" required />
      </label>
      <label>
        Password
        <input v-model="password" type="password" autocomplete="current-password" required />
      </label>
      <button type="submit" :disabled="busy">Sign in</button>
    </form>
    <p v-if="error" class="auth-error">{{ error }}</p>
    <p class="auth-switch">
      Need an account?
      <a href="#" @click.prevent="$emit('go-register')">Register</a>
    </p>
  </div>
</template>
