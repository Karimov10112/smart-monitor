import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh-token`, { refreshToken: refresh });
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);
          original.headers.Authorization = `Bearer ${data.token}`;
          return api(original);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  verifyOTP: (data: any) => api.post('/auth/verify-otp', data),
  sendMessageToAdmin: (data: { text: string }) => api.post('/auth/support', data),
  markMessagesAsRead: () => api.put('/auth/mark-support-read'),
  updateProfile: (data: any) => api.put('/auth/update-profile', data),
  forgotPassword: (data: any) => api.post('/auth/forgot-password', data),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  completeProfile: (userData: any) => api.post('/auth/complete-profile', userData),
  login: (data: any) => api.post('/auth/login', data),
  emailLogin: (data: any) => api.post('/auth/email-login', data),
  updatePassword: (passwordData: any) => api.put('/auth/update-password', passwordData),
};

export const bloodSugarAPI = {
  getRecords: (params?: any) => api.get('/blood-sugar', { params }),
  addRecord: (data: any) => api.post('/blood-sugar', data),
  updateRecord: (id: string, data: any) => api.put(`/blood-sugar/${id}`, data),
  deleteRecord: (id: string) => api.delete(`/blood-sugar/${id}`),
  getStats: () => api.get('/blood-sugar/stats'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  getUserRecords: (id: string) => api.get(`/admin/users/${id}/records`),
  updateRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  toggleBan: (id: string, reason?: string) => api.patch(`/admin/users/${id}/ban`, { reason }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  addNote: (id: string, notes: string) => api.patch(`/admin/users/${id}/notes`, { notes }),
  markMessagesAsRead: (id: string) => api.patch(`/admin/users/${id}/read-messages`),
  replyToUser: (userId: string, text: string) => api.post(`/admin/reply-to-user`, { userId, text }),
  getContacts: () => api.get('/admin/contacts'),
};

export const productAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.patch(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/admin/products/${id}`),
};

export const reminderAPI = {
  getAll: () => api.get('/reminders'),
  create: (data: any) => api.post('/reminders', data),
  update: (id: string, data: any) => api.put(`/reminders/${id}`, data),
  delete: (id: string) => api.delete(`/reminders/${id}`),
};

export const doctorAPI = {
  getPatients: (params?: any) => api.get('/doctor/patients', { params }),
  getPatientRecords: (id: string) => api.get(`/doctor/patients/${id}/records`),
  addNote: (id: string, notes: string) => api.patch(`/doctor/patients/${id}/notes`, { notes }),
};

export const aiAPI = {
  chat: (data: any) => api.post('/ai/chat', data),
  analyze: (data: any) => api.post('/ai/analyze', data),
};

export default api;
