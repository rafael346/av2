<template>
  <div class="page">
    <h1>Meu Perfil</h1>
    <div class="form-card">
      <AlertMessage :message="error" />
      <AlertMessage :message="success" type="success" />

      <form @submit.prevent="save">
        <div class="form-group">
          <label>Nome</label>
          <input v-model="form.name" type="text" class="form-control" />
        </div>
        <div class="form-group">
          <label>Telefone</label>
          <input v-model="form.phone" type="tel" class="form-control" />
        </div>
        <div class="form-group">
          <label>CPF</label>
          <input v-model="form.cpf" type="text" class="form-control" />
        </div>

        <hr />
        <h3>Endereço</h3>
        <div class="form-group">
          <label>CEP</label>
          <div class="input-group">
            <input v-model="form.address.cep" type="text" class="form-control" maxlength="9" />
            <button type="button" class="btn btn-secondary" @click="lookupCep" :disabled="cepLoading">
              {{ cepLoading ? '...' : 'Buscar' }}
            </button>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Logradouro</label>
            <input v-model="form.address.logradouro" type="text" class="form-control" />
          </div>
          <div class="form-group">
            <label>Número</label>
            <input v-model="form.address.numero" type="text" class="form-control" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Bairro</label>
            <input v-model="form.address.bairro" type="text" class="form-control" />
          </div>
          <div class="form-group">
            <label>Cidade</label>
            <input v-model="form.address.cidade" type="text" class="form-control" />
          </div>
        </div>

        <hr />
        <h3>Alterar Senha</h3>
        <div class="form-group">
          <label>Nova Senha (deixe em branco para manter)</label>
          <input v-model="form.password" type="password" class="form-control" />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { userService, externalService } from '@/services'
import AlertMessage from '@/components/AlertMessage.vue'

const authStore = useAuthStore()
const loading = ref(false)
const cepLoading = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  name: '',
  phone: '',
  cpf: '',
  password: '',
  address: { cep: '', logradouro: '', bairro: '', cidade: '', estado: '', numero: '', complemento: '' },
})

onMounted(() => {
  const u = authStore.user
  if (u) {
    form.value.name = u.name || ''
    form.value.phone = u.phone || ''
    form.value.cpf = u.cpf || ''
    form.value.address = { ...{ cep: '', logradouro: '', bairro: '', cidade: '', estado: '', numero: '', complemento: '' }, ...(u.address || {}) }
  }
})

const lookupCep = async () => {
  const cep = form.value.address.cep.replace(/\D/g, '')
  if (cep.length !== 8) return
  cepLoading.value = true
  try {
    const { data } = await externalService.getCep(cep)
    form.value.address = { ...form.value.address, ...data }
  } catch (err) {
    error.value = err.response?.data?.message || 'CEP não encontrado.'
  } finally {
    cepLoading.value = false
  }
}

const save = async () => {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const payload = {
      name: form.value.name,
      phone: form.value.phone,
      cpf: form.value.cpf,
      address: form.value.address,
    }
    if (form.value.password) payload.password = form.value.password
    const { data } = await userService.update(authStore.user._id, payload)
    authStore.user = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
    form.value.password = ''
    success.value = 'Perfil atualizado com sucesso!'
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao salvar.'
  } finally {
    loading.value = false
  }
}
</script>
