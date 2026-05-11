import apiCall from './api';

const subjectService = {
  // Get all subjects
  getAllSubjects: async () => {
    return apiCall('/subject');
  },

  // Get subject by ID
  getSubjectById: async (subjectId) => {
    return apiCall(`/subject/${subjectId}`);
  },

  // Get papers for a subject
  getSubjectPapers: async (subjectId) => {
    return apiCall(`/subject/${subjectId}/papers`);
  },

  // Get examiners for a subject
  getSubjectExaminers: async (subjectId) => {
    return apiCall(`/subject/${subjectId}/examiners`);
  },

  // Create subject
  createSubject: async (subjectData) => {
    return apiCall('/subject', {
      method: 'POST',
      body: JSON.stringify(subjectData),
    });
  },

  // Update subject
  updateSubject: async (subjectId, subjectData) => {
    return apiCall(`/subject/${subjectId}`, {
      method: 'PUT',
      body: JSON.stringify(subjectData),
    });
  },

  // Get all universities
  getAllUniversities: async () => {
    return apiCall('/universities');
  },
};

export default subjectService;
