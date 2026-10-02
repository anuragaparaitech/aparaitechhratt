import axios from 'axios'

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  if (typeof window !== 'undefined') {
    // Check if running inside Capacitor Android APK, iOS App, Chrome Extension, or file://
    const isNativeOrContainer = Boolean(
      window.Capacitor !== undefined ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'chrome-extension:' ||
      window.location.protocol === 'file:' ||
      // In Capacitor Android with androidScheme "https", hostname is localhost with no port
      (window.location.hostname === 'localhost' && (!window.location.port || window.location.port === '80' || window.location.port === '443')) ||
      (window.location.hostname === '127.0.0.1' && (!window.location.port || window.location.port === '80' || window.location.port === '443'))
    )

    if (isNativeOrContainer) {
      return 'https://aparaitechhratt.vercel.app'
    }

    // If on Vite dev server (e.g. localhost:3000 or localhost:5173), use relative path to allow Vite proxy
    if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && 
        (window.location.port === '3000' || window.location.port === '5173')) {
      return ''
    }

    // Default for web deployment (Vercel or custom domain)
    return 'https://aparaitechhratt.vercel.app'
  }

  return 'https://aparaitechhratt.vercel.app'
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
  checkIn: async (email, checkInTime, coords = {}, shift = null) => {
    const payload = { email, checkInTime }
    if (coords && coords.latitude !== undefined) payload.latitude = coords.latitude
    if (coords && coords.longitude !== undefined) payload.longitude = coords.longitude
    if (shift) payload.shift = shift
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
  getTodayStatus: async (date) => {
    const params = date ? { date } : {}
    const response = await api.get('/api/reports/daily/today-status', { params })
    return response.data
  },
  submitMailBlast: async (data) => {
    const response = await api.post('/api/reports/mail-blast', data)
    return response.data
  },
  getMailBlast: async (filters = {}) => {
    const response = await api.get('/api/reports/mail-blast', { params: filters })
    return response.data
  },
  getColleges: async () => {
    const response = await api.get('/api/reports/colleges')
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
  sendSingle: async (employeeId, data) => {
    const response = await api.post(`/api/messages/send/${employeeId}`, data)
    return response.data
  },
  sendBulk: async (data) => {
    const response = await api.post('/api/messages/send-bulk', data)
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

// ── Leave Management API ───────────────────────────────────────────────────────
export const leaveAPI = {
  apply: async (data) => {
    const response = await api.post('/api/leaves/apply', data)
    return response.data
  },
  getMyLeaves: async () => {
    const response = await api.get('/api/leaves/my-leaves')
    return response.data
  },
  getAllLeaves: async (params = {}) => {
    const response = await api.get('/api/leaves', { params })
    return response.data
  },
  updateStatus: async (id, data) => {
    const response = await api.put(`/api/leaves/${id}/status`, data)
    return response.data
  }
}

// ── Task Management API ────────────────────────────────────────────────────────
export const taskAPI = {
  create: async (data) => {
    const response = await api.post('/api/tasks', data)
    return response.data
  },
  getMyTasks: async () => {
    const response = await api.get('/api/tasks/my-tasks')
    return response.data
  },
  getAllTasks: async (params = {}) => {
    const response = await api.get('/api/tasks', { params })
    return response.data
  },
  updateStatus: async (id, data) => {
    const response = await api.put(`/api/tasks/${id}/status`, data)
    return response.data
  },
  addComment: async (id, data) => {
    const response = await api.post(`/api/tasks/${id}/comments`, data)
    return response.data
  }
}

// ── Company Announcements API ──────────────────────────────────────────────────
export const announcementAPI = {
  getAll: async () => {
    const response = await api.get('/api/announcements')
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/api/announcements', data)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/api/announcements/${id}`)
    return response.data
  }
}

// ── Official Document Centre API ───────────────────────────────────────────────
export const documentAPI = {
  getMyDocuments: async () => {
    const response = await api.get('/api/documents/my-documents')
    return response.data
  },
  generate: async (docType) => {
    const response = await api.get(`/api/documents/generate/${docType}`)
    return response.data
  }
}

// ── Product Conversions & 7-Day Pipeline API ─────────────────────────────────
export const conversionsAPI = {
  create: async (data) => {
    const response = await api.post('/api/conversions', data)
    return response.data
  },
  getAll: async (params = {}) => {
    const response = await api.get('/api/conversions', { params })
    return response.data
  },
  finalize: async (id, data) => {
    const response = await api.patch(`/api/conversions/${id}/finalize`, data)
    return response.data
  },
  getAdminAlerts: async () => {
    const response = await api.get('/api/conversions/admin-alerts')
    return response.data
  }
}

export default api


