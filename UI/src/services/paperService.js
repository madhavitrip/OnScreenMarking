import apiCall from './api';

const paperService = {
  // Get all papers
  getAllPapers: async () => {
    return apiCall('/papers');
  },

  // Get paper by ID
  getPaperById: async (paperId) => {
    return apiCall(`/papers/${paperId}`);
  },

  // Create paper
  createPaper: async (paperData) => {
    return apiCall('/papers', {
      method: 'POST',
      body: JSON.stringify(paperData),
    });
  },

  // Update paper
  updatePaper: async (paperId, paperData) => {
    return apiCall(`/papers/${paperId}`, {
      method: 'PUT',
      body: JSON.stringify(paperData),
    });
  },

  // Delete paper
  deletePaper: async (paperId) => {
    return apiCall(`/papers/${paperId}`, {
      method: 'DELETE',
    });
  },
};

export default paperService;
