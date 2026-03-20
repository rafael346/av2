import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => ['admin', 'secretario'].includes(user.value?.role))

  const setAuth = (newToken, newUser) => {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setAuth(data.token, data.user)
    return data.user
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    setAuth(data.token, data.user)
    return data.user
  }

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me')
      user.value = data.user
      localStorage.setItem('user', JSON.stringify(data.user))
    } catch {
      logout()
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    router.push('/login')
  }

  // Restore token on page reload
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  return { token, user, isLoggedIn, isAdmin, login, register, fetchMe, logout }
})
