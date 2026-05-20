import apiCall from './api';

const userService = {
  getAllUsers: async (universityId) => {
    const url = `/users${universityId ? `?universityId=${universityId}` : ''}`;
    return apiCall(url);
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
  },

  approveUser: async (userId) => {
    return apiCall(`/users/${userId}/approve`, {
      method: 'PUT'
    });
  },

  inviteUser: async (inviteData) => {
    return apiCall('/users/invite', {
      method: 'POST',
      body: JSON.stringify(inviteData)
    });
  }
};

export default userService;
