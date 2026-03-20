import api from './api'

export const appointmentService = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id) => api.delete(`/appointments/${id}`),
  getSlots: (doctor, date) => api.get('/appointments/slots', { params: { doctor, date } }),
}

export const externalService = {
  getCep: (cep) => api.get(`/external/cep/${cep}`),
  getWeather: (city, date) => api.get('/external/weather', { params: { city, date } }),
}

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
}
