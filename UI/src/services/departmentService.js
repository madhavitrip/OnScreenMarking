import apiCall from './api';

const departmentService = {
  getAllDepartments: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.pageSize !== undefined) query.append('pageSize', params.pageSize);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString();
    return apiCall(`/department${queryString ? `?${queryString}` : ''}`);
  },

  getDepartmentsByUniversity: async (universityId, params = {}) => {
    const query = new URLSearchParams();
    if (universityId) query.append('universityId', universityId);
    if (params.page) query.append('page', params.page);
    if (params.pageSize !== undefined) query.append('pageSize', params.pageSize);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString();
    return apiCall(`/department${queryString ? `?${queryString}` : ''}`);
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
