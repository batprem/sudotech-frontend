<script setup>
import { ref } from 'vue'
import { register } from '../api/auth.js'
import { auth } from '../auth/store.js'

defineEmits(['go-login'])

const username = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function submit() {
  if (!username.value || !password.value || busy.value) return
  error.value = ''
  busy.value = true
  try {
    const { token, user } = await register(username.value.trim(), password.value)
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
    <h2>Create account</h2>
    <form class="auth-form" @submit.prevent="submit">
      <label>
        Username
        <input
          v-model="username"
          type="text"
          autocomplete="username"
          minlength="3"
          maxlength="32"
          required
        />
        <small>3–32 chars, letters / numbers / underscore</small>
      </label>
      <label>
        Password
        <input
          v-model="password"
          type="password"
          autocomplete="new-password"
          minlength="8"
          required
        />
        <small>at least 8 characters</small>
      </label>
      <button type="submit" :disabled="busy">Create account</button>
    </form>
    <p v-if="error" class="auth-error">{{ error }}</p>
    <p class="auth-switch">
      Already have an account?
      <a href="#" @click.prevent="$emit('go-login')">Sign in</a>
    </p>
  </div>
</template>
