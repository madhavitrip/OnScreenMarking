import apiCall from './api';

const projectService = {
  // Get all projects
  getAllProjects: async () => {
    return apiCall('/project');
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
  getProjectsBySession: async (sessionId) => {
    const projects = await apiCall('/project');
    return projects.filter(p => p.sessionId === sessionId);
  }
};

export default projectService;
