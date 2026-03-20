<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <RouterLink to="/dashboard">🏥 Clínica Médica</RouterLink>
    </div>
    <ul class="navbar-links">
      <li><RouterLink to="/dashboard">Início</RouterLink></li>
      <li><RouterLink to="/appointments">Consultas</RouterLink></li>
      <li><RouterLink to="/appointments/new">Agendar</RouterLink></li>
      <li v-if="authStore.isAdmin"><RouterLink to="/admin">Painel Admin</RouterLink></li>
      <li><RouterLink to="/profile">Perfil</RouterLink></li>
    </ul>
    <div class="navbar-user">
      <span>{{ authStore.user?.name }}</span>
      <button class="btn btn-sm btn-outline" @click="authStore.logout()">Sair</button>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/store/auth'
const authStore = useAuthStore()
</script>
