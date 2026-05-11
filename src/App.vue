<script setup>
import { ref } from 'vue'
import { auth } from './auth/store.js'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import BoardsListView from './views/BoardsListView.vue'
import BoardView from './views/BoardView.vue'

const view = ref('login') // 'login' | 'register'
const activeBoardId = ref(null)

function signOut() {
  auth.logout()
  activeBoardId.value = null
  view.value = 'login'
}
</script>

<template>
  <h1>Kanban</h1>

  <template v-if="auth.isAuthed.value">
    <header class="topbar">
      <span>Hi, {{ auth.state.user?.username }}</span>
      <button class="ghost" type="button" @click="signOut()">Sign out</button>
    </header>

    <BoardView
      v-if="activeBoardId"
      :board-id="activeBoardId"
      @back="activeBoardId = null"
    />
    <BoardsListView
      v-else
      @open="(id) => activeBoardId = id"
    />
  </template>

  <LoginView    v-else-if="view === 'login'"    @go-register="view = 'register'" />
  <RegisterView v-else                          @go-login="view = 'login'" />
</template>
