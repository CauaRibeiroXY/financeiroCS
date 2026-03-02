import axios from 'axios';

export const api = axios.create({
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona um interceptor global para anexar a senha em todas as requisições Axios (caso utilizadas)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('app_password');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  api.interceptors.request.use((config) => config);
}