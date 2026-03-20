<template>
  <div class="card appointment-card" :class="`status-${appointment.status}`">
    <div class="card-header">
      <strong>{{ appointment.specialty }}</strong>
      <span class="badge" :class="`badge-${appointment.status}`">{{ labelStatus(appointment.status) }}</span>
    </div>
    <div class="card-body">
      <p><strong>Médico:</strong> {{ appointment.doctor }}</p>
      <p><strong>Paciente:</strong> {{ appointment.patient?.name || '—' }}</p>
      <p><strong>Data:</strong> {{ formatDate(appointment.date) }}</p>
      <p v-if="appointment.weatherAlert?.hasRain" class="weather-alert">
        ⛈️ Previsão de chuva neste dia: {{ appointment.weatherAlert.description }}
      </p>
    </div>
    <div class="card-footer">
      <RouterLink :to="`/appointments/${appointment._id}`" class="btn btn-sm btn-primary">Detalhes</RouterLink>
      <button
        v-if="appointment.status !== 'cancelado' && appointment.status !== 'concluido'"
        class="btn btn-sm btn-danger"
        @click="$emit('cancel', appointment._id)"
      >Cancelar</button>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'

defineProps({ appointment: Object })
defineEmits(['cancel'])

const formatDate = (d) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
const labelStatus = (s) => ({ agendado: 'Agendado', confirmado: 'Confirmado', cancelado: 'Cancelado', concluido: 'Concluído' }[s] || s)
</script>
