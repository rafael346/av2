<template>
  <div class="page">
    <div class="page-header">
      <h1>Agendar Consulta</h1>
    </div>

    <div class="form-card">
      <AlertMessage :message="error" />
      <AlertMessage v-if="weatherAlert.hasRain" type="warning"
        :message="`⛈️ Atenção: há previsão de chuva neste dia! ${weatherAlert.description}`" />

      <form @submit.prevent="handleSubmit">
        <!-- Doctor & Specialty -->
        <div class="form-row">
          <div class="form-group">
            <label>Médico *</label>
            <input v-model="form.doctor" type="text" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Especialidade *</label>
            <input v-model="form.specialty" type="text" class="form-control" required />
          </div>
        </div>

        <!-- Date picker -->
        <div class="form-row">
          <div class="form-group">
            <label>Data *</label>
            <input v-model="form.dateOnly" type="date" class="form-control" :min="today" required @change="onDateChange" />
          </div>
          <div class="form-group">
            <label>Horário *</label>
            <select v-model="form.timeSlot" class="form-control" required :disabled="!slots.length">
              <option value="" disabled>{{ slots.length ? 'Selecione' : 'Escolha data e médico' }}</option>
              <option v-for="s in slots" :key="s.time" :value="s.time" :disabled="!s.available">
                {{ formatTime(s.time) }} {{ s.available ? '' : '(indisponível)' }}
              </option>
            </select>
          </div>
        </div>

        <!-- CEP Address lookup -->
        <div class="form-group">
          <label>CEP</label>
          <div class="input-group">
            <input v-model="form.cep" type="text" class="form-control" placeholder="00000-000" maxlength="9" />
            <button type="button" class="btn btn-secondary" @click="lookupCep" :disabled="cepLoading">
              {{ cepLoading ? '...' : 'Buscar' }}
            </button>
          </div>
        </div>

        <div v-if="form.address.logradouro" class="address-preview">
          <p>{{ form.address.logradouro }}, {{ form.address.bairro }} — {{ form.address.cidade }}/{{ form.address.estado }}</p>
          <input v-model="form.address.numero" type="text" class="form-control form-control-sm" placeholder="Número" />
          <input v-model="form.address.complemento" type="text" class="form-control form-control-sm" placeholder="Complemento" />
        </div>

        <div class="form-group">
          <label>Observações</label>
          <textarea v-model="form.notes" class="form-control" rows="3" maxlength="500"></textarea>
        </div>

        <div class="form-actions">
          <RouterLink to="/appointments" class="btn btn-secondary">Cancelar</RouterLink>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Agendando...' : 'Confirmar Agendamento' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { appointmentService, externalService } from '@/services'
import AlertMessage from '@/components/AlertMessage.vue'

const router = useRouter()

const today = new Date().toISOString().split('T')[0]

const form = ref({
  doctor: '',
  specialty: '',
  dateOnly: '',
  timeSlot: '',
  cep: '',
  notes: '',
  address: { cep: '', logradouro: '', bairro: '', cidade: '', estado: '', numero: '', complemento: '' },
})

const slots = ref([])
const loading = ref(false)
const cepLoading = ref(false)
const error = ref('')
const weatherAlert = ref({ hasRain: false, description: '' })

const formatTime = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

const fetchSlots = async () => {
  if (!form.value.doctor || !form.value.dateOnly) return
  const { data } = await appointmentService.getSlots(form.value.doctor, form.value.dateOnly)
  slots.value = data.slots
}

const fetchWeather = async () => {
  if (!form.value.dateOnly) return
  try {
    const city = form.value.address.cidade || 'São Paulo'
    const { data } = await externalService.getWeather(city, form.value.dateOnly)
    weatherAlert.value = data
  } catch {
    weatherAlert.value = { hasRain: false }
  }
}

const onDateChange = () => {
  form.value.timeSlot = ''
  fetchSlots()
  fetchWeather()
}

watch(() => form.value.doctor, () => {
  if (form.value.dateOnly) fetchSlots()
})

const lookupCep = async () => {
  const cep = form.value.cep.replace(/\D/g, '')
  if (cep.length !== 8) return
  cepLoading.value = true
  try {
    const { data } = await externalService.getCep(cep)
    form.value.address = { ...form.value.address, ...data }
    await fetchWeather()
  } catch (err) {
    error.value = err.response?.data?.message || 'CEP não encontrado.'
  } finally {
    cepLoading.value = false
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  try {
    const date = form.value.timeSlot
    await appointmentService.create({
      doctor: form.value.doctor,
      specialty: form.value.specialty,
      date,
      notes: form.value.notes,
      address: { ...form.value.address, cep: form.value.cep },
    })
    router.push('/appointments')
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao agendar consulta.'
  } finally {
    loading.value = false
  }
}
</script>
