import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,////this is new change i have done
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh-token', { refreshToken });
          const { token } = response.data;
          
          localStorage.setItem('token', token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Handle refresh token failure
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      }
      return response.data;
    } catch (error) {
      const err = new Error(error.response?.data?.message || 'Login failed');
      err.status = error.response?.status;
      throw err;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      const err = new Error(error.response?.data?.message || 'Registration failed');
      err.status = error.response?.status;
      throw err;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return response.data;
    } catch (error) {
      // Always clear tokens even if logout request fails
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      const err = new Error(error.response?.data?.message || 'Logout failed');
      err.status = error.response?.status;
      throw err;
    }
  }
};

export default api;