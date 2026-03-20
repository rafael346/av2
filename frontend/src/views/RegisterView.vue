<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>🏥 Clínica Médica</h1>
      <h2>Criar Conta</h2>
      <AlertMessage :message="error" />
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Nome completo</label>
          <input v-model="form.name" type="text" class="form-control" required />
        </div>
        <div class="form-group">
          <label>E-mail</label>
          <input v-model="form.email" type="email" class="form-control" required />
        </div>
        <div class="form-group">
          <label>Senha</label>
          <input v-model="form.password" type="password" class="form-control" placeholder="Mínimo 6 caracteres" required />
        </div>
        <div class="form-group">
          <label>Confirmar senha</label>
          <input v-model="form.confirm" type="password" class="form-control" required />
        </div>
        <div class="form-group">
          <label>Telefone</label>
          <input v-model="form.phone" type="tel" class="form-control" />
        </div>
        <div class="form-group">
          <label>CPF</label>
          <input v-model="form.cpf" type="text" class="form-control" placeholder="000.000.000-00" />
        </div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
        </button>
      </form>
      <p class="auth-link">Já tem conta? <RouterLink to="/login">Entrar</RouterLink></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import AlertMessage from '@/components/AlertMessage.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ name: '', email: '', password: '', confirm: '', phone: '', cpf: '' })
const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  if (form.value.password !== form.value.confirm) {
    error.value = 'As senhas não conferem.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const { confirm, ...payload } = form.value
    await authStore.register(payload)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao cadastrar.'
  } finally {
    loading.value = false
  }
}
</script>
