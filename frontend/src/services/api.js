import axios from 'axios'

const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'https://aparaitech-software-attendance-protal-9l04.onrender.com'
}

export const API_URL = getApiUrl()

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  let token = localStorage.getItem('aparaitech_token')
  
  // Fallback: Generate token dynamically from active user session if missing on refresh
  if (!token) {
    const savedUser = localStorage.getItem('aparaitech_current_user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        if (user && user.role && user.email) {
          token = btoa(`${user.role}:${user.email}`)
          localStorage.setItem('aparaitech_token', token)
        }
      } catch (err) {
        console.error('Fallback token generation failed', err)
      }
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

api.interceptors.response.use((response) => {
  return response
}, (error) => {
  if (error.response && error.response.status === 401) {
    console.warn('[Auth] Unauthorized request (401)! Clearing token and user session.')
    localStorage.removeItem('aparaitech_token')
    localStorage.removeItem('aparaitech_current_user')
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }
  return Promise.reject(error)
})

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password })
    return response.data
  },
  changePassword: async (email, oldPassword, newPassword) => {
    const response = await api.post('/api/auth/change-password', { email, oldPassword, newPassword })
    return response.data
  }
}

export const employeeAPI = {
  getAll: async () => {
    const response = await api.get('/api/employees')
    return response.data
  },
  add: async (employeeData) => {
    const response = await api.post('/api/employees', employeeData)
    return response.data
  },
  update: async (email, employeeData) => {
    const response = await api.put(`/api/employees/${encodeURIComponent(email)}`, employeeData)
    return response.data
  },
  delete: async (email) => {
    const response = await api.delete(`/api/employees/${email}`)
    return response.data
  },
  toggleStatus: async (email) => {
    const response = await api.post(`/api/employees/toggle-status`, { email })
    return response.data
  },
  deleteAll: async () => {
    const response = await api.delete('/api/employees')
    return response.data
  }
}

export const holidayAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get('/api/holidays', { params: filters })
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/api/holidays', data)
    return response.data
  },
  update: async (id, data) => {
    const response = await api.put(`/api/holidays/${id}`, data)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/api/holidays/${id}`)
    return response.data
  }
}

export const attendanceAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get('/api/attendance', { params: filters })
    return response.data
  },
  checkIn: async (email, checkInTime, coords = {}) => {
    const payload = { email, checkInTime }
    if (coords && coords.latitude !== undefined) payload.latitude = coords.latitude
    if (coords && coords.longitude !== undefined) payload.longitude = coords.longitude
    const response = await api.post('/api/attendance/check-in', payload)
    return response.data
  },
  checkOut: async (email, checkOutTime, coords = {}) => {
    const payload = { email, checkOutTime }
    if (coords && coords.latitude !== undefined) payload.latitude = coords.latitude
    if (coords && coords.longitude !== undefined) payload.longitude = coords.longitude
    const response = await api.post('/api/attendance/check-out', payload)
    return response.data
  },
  manualMark: async (attendanceData) => {
    const response = await api.post('/api/attendance/manual', attendanceData)
    return response.data
  },
  deleteRecord: async (id) => {
    const response = await api.delete(`/api/attendance/${id}`)
    return response.data
  },
  clearAll: async () => {
    const response = await api.delete('/api/attendance')
    return response.data
  },
  getMissingCheckouts: async () => {
    const response = await api.get('/api/attendance/missing-checkout')
    return response.data
  },
  performManualCheckout: async (email, adminName) => {
    const response = await api.post('/api/attendance/manual-checkout', { email, adminName })
    return response.data
  }
}

// ── Face Enrollment & Verification API ──────────────────────────────────────────
export const faceAPI = {
  // Enroll / update a face image for an employee (+ optional 128-d descriptor)
  enroll: async (email, imageDataUrl, enrolledBy, faceDescriptor) => {
    const response = await api.post('/api/face/enroll', { email, imageDataUrl, enrolledBy, faceDescriptor })
    return response.data
  },
  // Get enrolled face info for an employee
  get: async (email) => {
    const response = await api.get(`/api/face/${encodeURIComponent(email)}`)
    return response.data
  },
  // Admin: reset enrolled face for an employee
  reset: async (email) => {
    const response = await api.delete(`/api/face/${encodeURIComponent(email)}`)
    return response.data
  },
  // Admin: get all employees with face enrollment status
  getAllStatus: async () => {
    const response = await api.get('/api/face/all-status')
    return response.data
  },
  // Save captured attendance photo and verification result
  saveAttendancePhoto: async (email, date, photoType, imageDataUrl, faceVerified, faceScore) => {
    const response = await api.post('/api/face/save-attendance-photo', {
      email, date, photoType, imageDataUrl, faceVerified, faceScore
    })
    return response.data
  }
}

// ── Daily & Mail Blast Reports API ─────────────────────────────────────────────
export const reportsAPI = {
  submitDaily: async (data) => {
    const response = await api.post('/api/reports/daily', data)
    return response.data
  },
  getDaily: async (filters = {}) => {
    const response = await api.get('/api/reports/daily', { params: filters })
    return response.data
  },
  getTodayStatus: async () => {
    const response = await api.get('/api/reports/daily/today-status')
    return response.data
  },
  submitMailBlast: async (data) => {
    const response = await api.post('/api/reports/mail-blast', data)
    return response.data
  },
  getMailBlast: async (filters = {}) => {
    const response = await api.get('/api/reports/mail-blast', { params: filters })
    return response.data
  }
}

// ── Performance & Working Portal Analytics API ─────────────────────────────────
export const analyticsAPI = {
  getMyPerformance: async () => {
    const response = await api.get('/api/analytics/my-performance')
    return response.data
  },
  getLeaderboard: async (period = 'month') => {
    const response = await api.get('/api/analytics/leaderboard', { params: { period } })
    return response.data
  },
  getRevenueTracker: async () => {
    const response = await api.get('/api/analytics/revenue')
    return response.data
  },
  getTeamOverview: async () => {
    const response = await api.get('/api/analytics/team-overview')
    return response.data
  }
}

// ── Administrative & Employee Messaging API ────────────────────────────────────
export const messageAPI = {
  getEmployeeMessages: async () => {
    const response = await api.get('/api/messages/employee')
    return response.data
  },
  markAsRead: async (id) => {
    const response = await api.put(`/api/messages/${id}/read`)
    return response.data
  },
  toggleArchive: async (id) => {
    const response = await api.put(`/api/messages/${id}/archive`)
    return response.data
  },
  sendSingle: async (data) => {
    const response = await api.post('/api/messages/send', data)
    return response.data
  },
  broadcast: async (data) => {
    const response = await api.post('/api/messages/broadcast', data)
    return response.data
  },
  getAdminHistory: async (params = {}) => {
    const response = await api.get('/api/messages/admin/history', { params })
    return response.data
  }
}

export default api

