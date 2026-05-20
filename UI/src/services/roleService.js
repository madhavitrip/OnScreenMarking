import apiCall from './api';

const roleService = {
  // Get all roles
  getAllRoles: async () => {
    return apiCall('/role');
  },

  // Get role by ID
  getRoleById: async (roleId) => {
    return apiCall(`/role/${roleId}`);
  },

  // Create new role
  createRole: async (roleData) => {
    return apiCall('/role/create', {
      method: 'POST',
      body: JSON.stringify(roleData)
    });
  },

  // Update role
  updateRole: async (roleId, roleData) => {
    return apiCall(`/role/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(roleData)
    });
  },

  // Delete role
  deleteRole: async (roleId) => {
    return apiCall(`/role/${roleId}`, {
      method: 'DELETE'
    });
  },

  // Get all available permissions
  getAllPermissions: async () => {
    return apiCall('/role/permissions/all');
  }
};

export default roleService;
