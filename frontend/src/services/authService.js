import api from './api';

class AuthService {
  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw error;
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      await api.post('/auth/logout');
      return { success: true };
    } catch (error) {
      // Even if logout fails on server, we'll clear local storage
      return { success: true };
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: newPassword
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw error;
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw error;
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh-token');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw error;
    }
  }
}

export const authService = new AuthService();