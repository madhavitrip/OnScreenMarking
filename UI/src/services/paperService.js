import apiCall from './api';

const paperService = {
  // Get all papers
  getAllPapers: async () => {
    return apiCall('/papers');
  },

  // Get papers by project
  getPapersByProject: async (projectId) => {
    return apiCall(`/papers?projectId=${projectId}`);
  },

  // Get papers by subject
  getPapersBySubject: async (subjectId) => {
    return apiCall(`/papers?subjectId=${subjectId}`);
  },

  // Get paper by ID
  getPaperById: async (paperId) => {
    return apiCall(`/papers/${paperId}`);
  },

  // Get all subjects for a paper
  getPaperSubjects: async (paperId) => {
    return apiCall(`/papers/${paperId}/subjects`);
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

  // Add subject to paper (many-to-many)
  addSubjectToPaper: async (paperId, subjectId) => {
    return apiCall(`/papers/${paperId}/subjects/${subjectId}`, {
      method: 'POST',
    });
  },

  // Remove subject from paper
  removeSubjectFromPaper: async (paperId, subjectId) => {
    return apiCall(`/papers/${paperId}/subjects/${subjectId}`, {
      method: 'DELETE',
    });
  },
};

export default paperService;
