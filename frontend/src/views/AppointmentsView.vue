<template>
  <div class="page">
    <div class="page-header">
      <h1>Minhas Consultas</h1>
      <RouterLink to="/appointments/new" class="btn btn-primary">+ Nova Consulta</RouterLink>
    </div>

    <!-- Filters -->
    <div class="filters">
      <select v-model="filterStatus" class="form-control form-control-sm select-filter">
        <option value="">Todos os status</option>
        <option value="agendado">Agendado</option>
        <option value="confirmado">Confirmado</option>
        <option value="cancelado">Cancelado</option>
        <option value="concluido">Concluído</option>
      </select>
      <input v-model="filterDate" type="date" class="form-control form-control-sm" />
      <button class="btn btn-secondary btn-sm" @click="clearFilters">Limpar</button>
    </div>

    <div v-if="loading" class="loading">Carregando...</div>
    <div v-else-if="filtered.length === 0" class="empty-state">Nenhuma consulta encontrada.</div>
    <div class="cards-grid" v-else>
      <AppointmentCard
        v-for="a in filtered"
        :key="a._id"
        :appointment="a"
        @cancel="cancelAppointment"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { appointmentService } from '@/services'
import AppointmentCard from '@/components/AppointmentCard.vue'

const appointments = ref([])
const loading = ref(true)
const filterStatus = ref('')
const filterDate = ref('')

const filtered = computed(() => {
  return appointments.value.filter((a) => {
    const matchStatus = !filterStatus.value || a.status === filterStatus.value
    const matchDate = !filterDate.value || a.date.startsWith(filterDate.value)
    return matchStatus && matchDate
  })
})

const clearFilters = () => {
  filterStatus.value = ''
  filterDate.value = ''
}

const load = async () => {
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
  await load()
}

onMounted(load)
</script>
