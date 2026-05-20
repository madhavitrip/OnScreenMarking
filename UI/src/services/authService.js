import apiCall from './api';

const authService = {
  login: async (email, password) => {
    return apiCall('/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register: async (userData) => {
    return apiCall('/Auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  getInvitationDetails: async (token) => {
    return apiCall(`/Auth/invitation-details?token=${encodeURIComponent(token)}`);
  },

  acceptInvitation: async (acceptData) => {
    return apiCall('/Auth/accept-invitation', {
      method: 'POST',
      body: JSON.stringify(acceptData)
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('profileImage');
    localStorage.removeItem('universityId');
    localStorage.removeItem('departmentId');
  }
};

export default authService;
