import apiCall from './api';

const projectService = {
  // Get all projects
  getAllProjects: async (universityId) => {
    const url = `/project${universityId ? `?universityId=${universityId}` : ''}`;
    return apiCall(url);
  },

  getProjects: async (universityId) => {
    return projectService.getAllProjects(universityId);
  },

  // Get project by ID
  getProjectById: async (projectId) => {
    return apiCall(`/project/${projectId}`);
  },

  // Create project
  createProject: async (projectData) => {
    return apiCall('/project', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    return apiCall(`/project/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
  },

  // Delete project
  deleteProject: async (projectId) => {
    return apiCall(`/project/${projectId}`, {
      method: 'DELETE'
    });
  },

  // Get projects by session
  getProjectsBySession: async (sessionId, universityId) => {
    const url = `/project?sessionId=${sessionId}${universityId ? `&universityId=${universityId}` : ''}`;
    return apiCall(url);
  }
};

export default projectService;
