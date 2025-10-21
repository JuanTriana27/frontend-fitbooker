import axios from 'axios';

// Configuración para producción y desarrollo
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://gimnasio-app-8i5w.onrender.com'
  : 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Timeout: El servidor tardó demasiado en responder');
    } else if (error.response?.status === 404) {
      console.error('🔍 Error 404: Endpoint no encontrado');
    } else if (error.response?.status >= 500) {
      console.error('🚨 Error del servidor:', error.response.status);
    }
    return Promise.reject(error);
  }
);

export default api;