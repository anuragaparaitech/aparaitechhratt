import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/env';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('aparaitech_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('[API] Token read error:', err);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for session expiration
api.interceptors.response.use((response) => {
  return response;
}, async (error) => {
  if (error.response && error.response.status === 401) {
    console.warn('[API] 401 Unauthorized - clearing session');
    try {
      await AsyncStorage.removeItem('aparaitech_token');
      await AsyncStorage.removeItem('aparaitech_user');
    } catch (e) {}
  }
  return Promise.reject(error);
});

// ── 1. AUTHENTICATION API ──────────────────────────────────────────────────
export const authAPI = {
  login: async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    return res.data;
  },
  passcodeLogin: async (email, passcode) => {
    const res = await api.post('/api/auth/passcode-login', { email, passcode });
    return res.data;
  },
  forgotPassword: async (email) => {
    const res = await api.post('/api/auth/forgot-password', { email });
    return res.data;
  },
  verifyOtp: async (email, otp, newPassword) => {
    const res = await api.post('/api/auth/verify-otp', { email, otp, newPassword });
    return res.data;
  },
  changePassword: async (email, oldPassword, newPassword) => {
    const res = await api.post('/api/auth/change-password', { email, oldPassword, newPassword });
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/api/auth/profile', data);
    return res.data;
  }
};

// ── 2. ATTENDANCE & PUNCH API ──────────────────────────────────────────────
export const attendanceAPI = {
  checkIn: async (data) => {
    const res = await api.post('/api/attendance/check-in', data);
    return res.data;
  },
  checkOut: async (data) => {
    const res = await api.post('/api/attendance/check-out', data);
    return res.data;
  },
  getAll: async (params = {}) => {
    const res = await api.get('/api/attendance', { params });
    return res.data;
  },
  getLiveSessions: async () => {
    const res = await api.get('/api/attendance/live');
    return res.data;
  }
};

// ── 3. WORKING REPORTS API ─────────────────────────────────────────────────
export const reportsAPI = {
  submitDaily: async (data) => {
    const res = await api.post('/api/reports/daily', data);
    return res.data;
  },
  getDaily: async (params = {}) => {
    const res = await api.get('/api/reports/daily', { params });
    return res.data;
  },
  getTodayStatus: async (date = null) => {
    const res = await api.get('/api/reports/daily/today-status', { params: date ? { date } : {} });
    return res.data;
  },
  submitMailBlast: async (data) => {
    const res = await api.post('/api/reports/mail-blast', data);
    return res.data;
  },
  getMailBlast: async (params = {}) => {
    const res = await api.get('/api/reports/mail-blast', { params });
    return res.data;
  },
  getColleges: async () => {
    const res = await api.get('/api/reports/colleges');
    return res.data;
  }
};

// ── 4. ANALYTICS & REVENUE API ─────────────────────────────────────────────
export const analyticsAPI = {
  getMyPerformance: async () => {
    const res = await api.get('/api/analytics/my-performance');
    return res.data;
  },
  getLeaderboard: async (period = 'month') => {
    const res = await api.get('/api/analytics/leaderboard', { params: { period } });
    return res.data;
  },
  getRevenue: async () => {
    const res = await api.get('/api/analytics/revenue');
    return res.data;
  },
  getTeamOverview: async () => {
    const res = await api.get('/api/analytics/team-overview');
    return res.data;
  }
};

// ── 5. MESSAGE CENTRE API ──────────────────────────────────────────────────
export const messageAPI = {
  getEmployeeMessages: async () => {
    const res = await api.get('/api/messages/employee');
    return res.data;
  },
  markAsRead: async (id) => {
    const res = await api.put(`/api/messages/${id}/read`);
    return res.data;
  },
  toggleArchive: async (id) => {
    const res = await api.put(`/api/messages/${id}/archive`);
    return res.data;
  },
  sendSingle: async (data) => {
    const res = await api.post('/api/messages/send', data);
    return res.data;
  },
  broadcast: async (data) => {
    const res = await api.post('/api/messages/broadcast', data);
    return res.data;
  }
};

// ── 6. LEAVE MANAGEMENT API ────────────────────────────────────────────────
export const leaveAPI = {
  apply: async (data) => {
    const res = await api.post('/api/leaves/apply', data);
    return res.data;
  },
  getMyLeaves: async () => {
    const res = await api.get('/api/leaves/my-leaves');
    return res.data;
  },
  getAllLeaves: async (params = {}) => {
    const res = await api.get('/api/leaves', { params });
    return res.data;
  },
  updateStatus: async (id, data) => {
    const res = await api.put(`/api/leaves/${id}/status`, data);
    return res.data;
  }
};

// ── 7. TASK MANAGEMENT API ─────────────────────────────────────────────────
export const taskAPI = {
  create: async (data) => {
    const res = await api.post('/api/tasks', data);
    return res.data;
  },
  getMyTasks: async () => {
    const res = await api.get('/api/tasks/my-tasks');
    return res.data;
  },
  getAllTasks: async (params = {}) => {
    const res = await api.get('/api/tasks', { params });
    return res.data;
  },
  updateStatus: async (id, data) => {
    const res = await api.put(`/api/tasks/${id}/status`, data);
    return res.data;
  },
  addComment: async (id, text) => {
    const res = await api.post(`/api/tasks/${id}/comments`, { text });
    return res.data;
  }
};

// ── 8. ANNOUNCEMENTS API ───────────────────────────────────────────────────
export const announcementAPI = {
  getAll: async () => {
    const res = await api.get('/api/announcements');
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/api/announcements', data);
    return res.data;
  }
};

// ── 9. DOCUMENT CENTRE API ─────────────────────────────────────────────────
export const documentAPI = {
  getMyDocuments: async () => {
    const res = await api.get('/api/documents/my-documents');
    return res.data;
  },
  generate: async (docType) => {
    const res = await api.get(`/api/documents/generate/${docType}`);
    return res.data;
  }
};

// ── 10. PRODUCT CONVERSIONS & ONBOARDING API ───────────────────────────────
export const conversionAPI = {
  create: async (data) => {
    const res = await api.post('/api/conversions', data);
    return res.data;
  },
  getAll: async (params = {}) => {
    const res = await api.get('/api/conversions', { params });
    return res.data;
  },
  finalize: async (id, data) => {
    const res = await api.patch(`/api/conversions/${id}/finalize`, data);
    return res.data;
  },
  getAlerts: async () => {
    const res = await api.get('/api/conversions/admin-alerts');
    return res.data;
  }
};

export default api;
