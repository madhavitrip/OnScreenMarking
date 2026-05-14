import apiCall from './api';

const universityService = {
  // Get all universities
  getAllUniversities: async () => {
    return apiCall('/universities');
  },

  // Get university by ID
  getUniversityById: async (universityId) => {
    return apiCall(`/universities/${universityId}`);
  },

  // Create university
  createUniversity: async (universityData) => {
    return apiCall('/universities', {
      method: 'POST',
      body: JSON.stringify(universityData)
    });
  },

  // Update university
  updateUniversity: async (universityId, universityData) => {
    return apiCall(`/universities/${universityId}`, {
      method: 'PUT',
      body: JSON.stringify(universityData)
    });
  },

  // Delete university
  deleteUniversity: async (universityId) => {
    return apiCall(`/universities/${universityId}`, {
      method: 'DELETE'
    });
  }
};

export default universityService;
