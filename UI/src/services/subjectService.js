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
};

export default subjectService;
