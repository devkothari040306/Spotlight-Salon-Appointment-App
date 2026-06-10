import axios from 'axios';

const api = axios.create({
  // Priority: explicit VITE_API_URL (set in Vercel) -> Render backend URL -> relative '/api' (dev proxy)
  baseURL:
    import.meta.env.VITE_API_URL ||
    'https://spotlight-salon-appointment-app.onrender.com/api' ||
    '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach stored token on every request (in case the instance was recreated)
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('salonUser');
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // malformed storage — ignore
    }
  }
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired — clear session
      localStorage.removeItem('salonUser');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Services ─────────────────────────────────────────────────────────────────
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getAllAdmin: () => api.get('/services/all'),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

// ─── Appointments ─────────────────────────────────────────────────────────────
export const appointmentsAPI = {
  getSlots: (serviceId, date) => api.get(`/appointments/slots?serviceId=${serviceId}&date=${date}`),
  create: (data) => api.post('/appointments', data),
  getMy: () => api.get('/appointments/my'),
  cancel: (id) => api.put(`/appointments/${id}/cancel`),
  adminGetAll: (params) => api.get('/appointments/admin/all', { params }),
  adminUpdateStatus: (id, status) => api.put(`/appointments/admin/${id}/status`, { status }),
};

export default api;
