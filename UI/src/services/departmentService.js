import apiCall from './api';

const departmentService = {
  getAllDepartments: async () => {
    return apiCall('/department');
  },

  getDepartmentsByUniversity: async (universityId) => {
    return apiCall(`/department?universityId=${universityId}`);
  },

  getDepartmentById: async (departmentId) => {
    return apiCall(`/department/${departmentId}`);
  },

  createDepartment: async (departmentData) => {
    return apiCall('/department', {
      method: 'POST',
      body: JSON.stringify(departmentData)
    });
  },

  updateDepartment: async (departmentId, departmentData) => {
    return apiCall(`/department/${departmentId}`, {
      method: 'PUT',
      body: JSON.stringify(departmentData)
    });
  },

  deleteDepartment: async (departmentId) => {
    return apiCall(`/department/${departmentId}`, {
      method: 'DELETE'
    });
  }
};

export default departmentService;
