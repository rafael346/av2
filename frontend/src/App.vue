<template>
  <div id="app-root">
    <NavBar v-if="authStore.isLoggedIn" />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
</script>
