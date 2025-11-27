// src/services/api.js - Client API centralisé (axios)
import axios from 'axios';

// Base URLs configurables via Vite (.env):
// VITE_API_BASE_URL, VITE_AUTH_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || '/api/auth';

// Instance axios pour l'API principale
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Instance axios pour l'API d'authentification
export const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
});

// Intercepteur pour ajouter le token si présent
const attachAuthToken = (config) => {
  try {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {
    // localStorage indisponible (SSR ou privacy) -> ignorer
  }
  return config;
};

api.interceptors.request.use(attachAuthToken);
authApi.interceptors.request.use(attachAuthToken);

// Helpers REST génériques
export const apiClient = {
  get: (url, params = {}, config = {}) => api.get(url, { params, ...config }).then(r => r.data),
  post: (url, data = {}, config = {}) => api.post(url, data, config).then(r => r.data),
  put: (url, data = {}, config = {}) => api.put(url, data, config).then(r => r.data),
  del: (url, config = {}) => api.delete(url, config).then(r => r.data),
};

export const authClient = {
  get: (url, params = {}, config = {}) => authApi.get(url, { params, ...config }).then(r => r.data),
  post: (url, data = {}, config = {}) => authApi.post(url, data, config).then(r => r.data),
};

// Domain-specific wrappers
export const demandesAPI = {
  getAllDemandes: (params = {}, config = {}) => apiClient.get('/demandes-players', params, config),
  healthCheck: (config = {}) => apiClient.get('/demandes-players/health', {}, config),
};

export const authAPI = {
  login: (credentials, config = {}) => authClient.post('/login', credentials, config),
  healthCheck: (config = {}) => authClient.get('/health', {}, config),
};
