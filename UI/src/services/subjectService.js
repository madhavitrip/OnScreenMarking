import apiCall from "./api";

const subjectService = {
  getAllSubjects: async () => {
    return apiCall("/subject");
  },
  
  getSubjectByUniversity: async (universityId) => {
    return apiCall(`/Subject/University?universityId=${universityId}`);
  },

  getSubjectByProject: async (projectId) => {
    return apiCall(`/Subject/Project?projectId=${projectId}`);
  },

  getSubjectsByDepartment: async (departmentId) => {
    return apiCall(`/subject?departmentId=${departmentId}`);
  },

  getSubjectById: async (subjectId) => {
    return apiCall(`/subject/${subjectId}`);
  },

  // Get all departments for a subject
  getSubjectDepartments: async (subjectId, universityId) => {
    const url = `/subject/${subjectId}/departments${universityId ? `?universityId=${universityId}` : ''}`;
    return apiCall(url);
  },

  // Get all papers for a subject
  getSubjectPapers: async (subjectId) => {
    return apiCall(`/subject/${subjectId}/papers`);
  },

  createSubject: async (subjectData) => {
    return apiCall("/subject", {
      method: "POST",
      body: JSON.stringify(subjectData),
    });
  },

  updateSubject: async (subjectId, subjectData) => {
    return apiCall(`/subject/${subjectId}`, {
      method: "PUT",
      body: JSON.stringify(subjectData),
    });
  },

  deleteSubject: async (subjectId) => {
    return apiCall(`/subject/${subjectId}`, {
      method: "DELETE",
    });
  },

  // Add department to subject (many-to-many)
  addDepartmentToSubject: async (subjectId, departmentId) => {
    return apiCall(`/subject/${subjectId}/departments/${departmentId}`, {
      method: "POST",
    });
  },

  // Remove department from subject
  removeDepartmentFromSubject: async (subjectId, departmentId) => {
    return apiCall(`/subject/${subjectId}/departments/${departmentId}`, {
      method: "DELETE",
    });
  },
};

export default subjectService;
