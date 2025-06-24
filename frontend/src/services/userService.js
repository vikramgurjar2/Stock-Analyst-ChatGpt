import api from './api';

export const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/api/user/profile');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/api/user/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  },

  // Get user preferences
  getPreferences: async () => {
    try {
      const response = await api.get('/api/user/preferences');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch preferences: ${error.message}`);
    }
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/api/user/preferences', preferences);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update preferences: ${error.message}`);
    }
  }
};
