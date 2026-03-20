<template>
  <div class="page">
    <h1>Olá, {{ authStore.user?.name }} 👋</h1>
    <p class="text-muted">Bem-vindo ao sistema de agendamentos da Clínica Médica.</p>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ stats.total }}</div>
        <div class="stat-label">Total de Consultas</div>
      </div>
      <div class="stat-card stat-primary">
        <div class="stat-number">{{ stats.agendado }}</div>
        <div class="stat-label">Agendadas</div>
      </div>
      <div class="stat-card stat-success">
        <div class="stat-number">{{ stats.confirmado }}</div>
        <div class="stat-label">Confirmadas</div>
      </div>
      <div class="stat-card stat-warning">
        <div class="stat-number">{{ stats.cancelado }}</div>
        <div class="stat-label">Canceladas</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h2>Próximas Consultas</h2>
        <RouterLink to="/appointments/new" class="btn btn-primary">+ Agendar</RouterLink>
      </div>
      <div v-if="loading" class="loading">Carregando...</div>
      <div v-else-if="upcoming.length === 0" class="empty-state">Nenhuma consulta agendada.</div>
      <div class="cards-grid" v-else>
        <AppointmentCard
          v-for="a in upcoming"
          :key="a._id"
          :appointment="a"
          @cancel="cancelAppointment"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { appointmentService } from '@/services'
import AppointmentCard from '@/components/AppointmentCard.vue'

const authStore = useAuthStore()
const appointments = ref([])
const loading = ref(true)

const stats = computed(() => ({
  total: appointments.value.length,
  agendado: appointments.value.filter((a) => a.status === 'agendado').length,
  confirmado: appointments.value.filter((a) => a.status === 'confirmado').length,
  cancelado: appointments.value.filter((a) => a.status === 'cancelado').length,
}))

const upcoming = computed(() =>
  appointments.value
    .filter((a) => a.status !== 'cancelado' && new Date(a.date) >= new Date())
    .slice(0, 6)
)

const loadAppointments = async () => {
  try {
    const { data } = await appointmentService.getAll()
    appointments.value = data.appointments
  } finally {
    loading.value = false
  }
}

const cancelAppointment = async (id) => {
  if (!confirm('Deseja cancelar esta consulta?')) return
  await appointmentService.cancel(id)
  await loadAppointments()
}

onMounted(loadAppointments)
</script>
