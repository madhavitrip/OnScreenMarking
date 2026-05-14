import apiCall from './api';

const userService = {
  getAllUsers: async () => {
    return apiCall('/users');
  },

  getUserById: async (userId) => {
    return apiCall(`/users/${userId}`);
  },

  createUser: async (userData) => {
    return apiCall('/Auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  updateUser: async (userId, userData) => {
    return apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  deleteUser: async (userId) => {
    return apiCall(`/users/${userId}`, {
      method: 'DELETE'
    });
  }
};

export default userService;
