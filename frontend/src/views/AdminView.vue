<template>
  <div class="page">
    <h1>Painel Administrativo</h1>

    <div class="tabs">
      <button :class="['tab', activeTab === 'appointments' ? 'tab-active' : '']" @click="activeTab = 'appointments'">
        Consultas
      </button>
      <button :class="['tab', activeTab === 'users' ? 'tab-active' : '']" @click="activeTab = 'users'">
        Usuários
      </button>
    </div>

    <!-- Appointments Tab -->
    <div v-if="activeTab === 'appointments'">
      <div class="filters">
        <input v-model="apptDate" type="date" class="form-control form-control-sm" @change="loadAppointments" />
        <select v-model="apptStatus" class="form-control form-control-sm select-filter" @change="loadAppointments">
          <option value="">Todos os status</option>
          <option value="agendado">Agendado</option>
          <option value="confirmado">Confirmado</option>
          <option value="cancelado">Cancelado</option>
          <option value="concluido">Concluído</option>
        </select>
      </div>
      <div v-if="apptLoading" class="loading">Carregando...</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Paciente</th><th>Médico</th><th>Especialidade</th><th>Data/Hora</th><th>Status</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in appointments" :key="a._id">
            <td>{{ a.patient?.name }}</td>
            <td>{{ a.doctor }}</td>
            <td>{{ a.specialty }}</td>
            <td>{{ formatDate(a.date) }}</td>
            <td><span class="badge" :class="`badge-${a.status}`">{{ labelStatus(a.status) }}</span></td>
            <td class="table-actions">
              <RouterLink :to="`/appointments/${a._id}`" class="btn btn-xs btn-primary">Ver</RouterLink>
              <button v-if="a.status !== 'cancelado'" class="btn btn-xs btn-success" @click="confirmAppt(a._id)">Confirmar</button>
              <button v-if="a.status !== 'cancelado' && a.status !== 'concluido'" class="btn btn-xs btn-danger" @click="cancelAppt(a._id)">Cancelar</button>
            </td>
          </tr>
          <tr v-if="appointments.length === 0"><td colspan="6" class="text-center">Nenhuma consulta encontrada.</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Users Tab -->
    <div v-if="activeTab === 'users'">
      <div v-if="usersLoading" class="loading">Carregando...</div>
      <table v-else class="table">
        <thead>
          <tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Telefone</th><th>Ações</th></tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u._id">
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td><span class="badge badge-confirmado">{{ u.role }}</span></td>
            <td>{{ u.phone || '—' }}</td>
            <td>
              <button v-if="authStore.user?.role === 'admin'" class="btn btn-xs btn-danger" @click="removeUser(u._id)">Desativar</button>
            </td>
          </tr>
          <tr v-if="users.length === 0"><td colspan="5" class="text-center">Nenhum usuário encontrado.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { appointmentService, userService } from '@/services'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const activeTab = ref('appointments')

const appointments = ref([])
const apptLoading = ref(false)
const apptDate = ref('')
const apptStatus = ref('')

const users = ref([])
const usersLoading = ref(false)

const formatDate = (d) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
const labelStatus = (s) => ({ agendado: 'Agendado', confirmado: 'Confirmado', cancelado: 'Cancelado', concluido: 'Concluído' }[s] || s)

const loadAppointments = async () => {
  apptLoading.value = true
  try {
    const params = {}
    if (apptDate.value) params.date = apptDate.value
    if (apptStatus.value) params.status = apptStatus.value
    const { data } = await appointmentService.getAll(params)
    appointments.value = data.appointments
  } finally {
    apptLoading.value = false
  }
}

const loadUsers = async () => {
  usersLoading.value = true
  try {
    const { data } = await userService.getAll()
    users.value = data.users
  } finally {
    usersLoading.value = false
  }
}

const confirmAppt = async (id) => {
  await appointmentService.update(id, { status: 'confirmado' })
  await loadAppointments()
}

const cancelAppt = async (id) => {
  if (!confirm('Cancelar esta consulta?')) return
  await appointmentService.cancel(id)
  await loadAppointments()
}

const removeUser = async (id) => {
  if (!confirm('Desativar este usuário?')) return
  await userService.remove(id)
  await loadUsers()
}

watch(activeTab, (tab) => {
  if (tab === 'users') loadUsers()
})

onMounted(loadAppointments)
</script>
