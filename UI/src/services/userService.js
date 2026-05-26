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
  },

  getExaminers: async (universityId, subjectId) => {
    const params = [];
    if (universityId) params.push(`universityId=${universityId}`);
    if (subjectId) params.push(`subjectId=${subjectId}`);
    const queryString = params.length > 0 ? '?' + params.join('&') : '';
    return apiCall(`/users/examiners${queryString}`);
  },

  getExaminersBySubjects: async (subjectIds, universityId) => {
    // Fetch examiners for multiple subjects and combine them
    if (!subjectIds || subjectIds.length === 0) {
      return this.getExaminers(universityId);
    }

    const examinerSets = await Promise.all(
      subjectIds.map(subId => this.getExaminers(universityId, subId))
    );

    // Combine all examiners and remove duplicates by ID
    const examinerMap = new Map();
    examinerSets.forEach(examiners => {
      examiners.forEach(examiner => {
        if (!examinerMap.has(examiner.id)) {
          examinerMap.set(examiner.id, examiner);
        }
      });
    });

    return Array.from(examinerMap.values());
  }
};

export default userService;
