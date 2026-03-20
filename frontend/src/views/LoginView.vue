<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>🏥 Clínica Médica</h1>
      <h2>Entrar</h2>
      <AlertMessage :message="error" />
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>E-mail</label>
          <input v-model="form.email" type="email" class="form-control" placeholder="seu@email.com" required />
        </div>
        <div class="form-group">
          <label>Senha</label>
          <input v-model="form.password" type="password" class="form-control" placeholder="Mínimo 6 caracteres" required />
        </div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
      <p class="auth-link">Não tem conta? <RouterLink to="/register">Cadastre-se</RouterLink></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import AlertMessage from '@/components/AlertMessage.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(form.value.email, form.value.password)
    router.push(route.query.redirect || '/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao fazer login.'
  } finally {
    loading.value = false
  }
}
</script>
