<template>
  <div class="page">
    <div v-if="loading" class="loading">Carregando...</div>
    <div v-else-if="!appointment" class="empty-state">Consulta não encontrada.</div>
    <template v-else>
      <div class="page-header">
        <h1>Detalhe da Consulta</h1>
        <RouterLink to="/appointments" class="btn btn-secondary">← Voltar</RouterLink>
      </div>

      <AlertMessage :message="error" />
      <AlertMessage v-if="appointment.weatherAlert?.hasRain" type="warning"
        :message="`⛈️ Previsão de chuva neste dia: ${appointment.weatherAlert.description}`" />

      <div class="detail-card">
        <div class="detail-row"><span>Paciente</span><strong>{{ appointment.patient?.name }}</strong></div>
        <div class="detail-row"><span>Médico</span><strong>{{ appointment.doctor }}</strong></div>
        <div class="detail-row"><span>Especialidade</span><strong>{{ appointment.specialty }}</strong></div>
        <div class="detail-row"><span>Data/Hora</span><strong>{{ formatDate(appointment.date) }}</strong></div>
        <div class="detail-row"><span>Status</span>
          <span class="badge" :class="`badge-${appointment.status}`">{{ labelStatus(appointment.status) }}</span>
        </div>
        <div class="detail-row" v-if="appointment.notes"><span>Observações</span><span>{{ appointment.notes }}</span></div>
        <div v-if="appointment.address?.logradouro" class="detail-row">
          <span>Endereço</span>
          <span>{{ appointment.address.logradouro }}, {{ appointment.address.numero }} — {{ appointment.address.cidade }}/{{ appointment.address.estado }}</span>
        </div>

        <!-- Status change (admin/secretario) -->
        <div class="form-row mt-2" v-if="authStore.isAdmin">
          <select v-model="newStatus" class="form-control form-control-sm select-filter">
            <option value="agendado">Agendado</option>
            <option value="confirmado">Confirmado</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <button class="btn btn-primary btn-sm" @click="updateStatus">Atualizar Status</button>
        </div>

        <div class="detail-actions">
          <button
            v-if="appointment.status !== 'cancelado' && appointment.status !== 'concluido'"
            class="btn btn-danger"
            @click="cancel"
          >Cancelar Consulta</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { appointmentService } from '@/services'
import { useAuthStore } from '@/store/auth'
import AlertMessage from '@/components/AlertMessage.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const appointment = ref(null)
const loading = ref(true)
const error = ref('')
const newStatus = ref('')

const formatDate = (d) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })
const labelStatus = (s) => ({ agendado: 'Agendado', confirmado: 'Confirmado', cancelado: 'Cancelado', concluido: 'Concluído' }[s] || s)

const load = async () => {
  try {
    const { data } = await appointmentService.getById(route.params.id)
    appointment.value = data.appointment
    newStatus.value = data.appointment.status
  } catch {
    error.value = 'Erro ao carregar consulta.'
  } finally {
    loading.value = false
  }
}

const updateStatus = async () => {
  try {
    const { data } = await appointmentService.update(route.params.id, { status: newStatus.value })
    appointment.value = data.appointment
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao atualizar.'
  }
}

const cancel = async () => {
  if (!confirm('Confirmar cancelamento?')) return
  await appointmentService.cancel(route.params.id)
  router.push('/appointments')
}

onMounted(load)
</script>
