import api from './api';

export const reportsService = {
  // Generate report
  generateReport: async (reportType, parameters) => {
    try {
      const response = await api.post('/api/reports/generate', {
        type: reportType,
        parameters
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  },

  // Get report list
  getReports: async () => {
    try {
      const response = await api.get('/api/reports');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }
  },

  // Download report
  downloadReport: async (reportId) => {
    try {
      const response = await api.get(`/api/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to download report: ${error.message}`);
    }
  },

  // Delete report
  deleteReport: async (reportId) => {
    try {
      const response = await api.delete(`/api/reports/${reportId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete report: ${error.message}`);
    }
  }
};