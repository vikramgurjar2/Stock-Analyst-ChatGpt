import api from './api';

class AuthService {
  constructor() {
    this.tokenKey = 'token';
    this.refreshTokenKey = 'refreshToken';
  }

  // Token management methods
  setTokens(accessToken, refreshToken) {
    localStorage.setItem(this.tokenKey, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }
  
  clearTokens() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  // Register user
  async register(userData) {
    try {
      const response = await api.post('/api/auth/register', userData);
      const { token, refreshToken } = response.data;
      
      // Automatically set tokens after successful registration
      this.setTokens(token, refreshToken);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors || []
      };
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/api/auth/login', credentials);  //  "/auth/login"
      const { token, refreshToken } = response.data;
      this.setTokens(token, refreshToken);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  }

  // Logout user
  async logout() {
    try {
      await api.post('/api/auth/logout');
      this.clearTokens();
      return { success: true };
    } catch (error) {
      // Always clear local tokens even if server request fails
      this.clearTokens();
      return { success: true };
    }
  }

  // Get current user profile with auto-refresh token
  async getProfile() {
    try {
      const response = await api.get('/api/auth/me');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      if (error.response?.status === 401) {
        // Try to refresh token
        const refreshed = await this.refreshToken();
        if (refreshed.success) {
          // Retry the original request
          return await this.getProfile();
        }
      }
      throw error;
    }
  }

  // Refresh authentication token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/api/auth/refresh-token', { refreshToken });
      const { token: newToken } = response.data;
      this.setTokens(newToken);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      this.clearTokens();
      return {
        success: false,
        message: 'Token refresh failed'
      };
    }
  }

  // Helper method to check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem(this.tokenKey);
  }

  // Get stored token
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Get stored refresh token
  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }
}

//export const authService = new AuthService();
export const authService = new AuthService();