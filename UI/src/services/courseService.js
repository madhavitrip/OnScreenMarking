import apiCall from './api';

const courseService = {
  getAllCourses: async (departmentId = null, universityId = null) => {
    let url = '/courses';
    const params = [];
    if (departmentId) params.push(`departmentId=${departmentId}`);
    if (universityId) params.push(`universityId=${universityId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return apiCall(url);
  },

  getCourseById: async (id) => {
    return apiCall(`/courses/${id}`);
  },

  createCourse: async (courseData) => {
    return apiCall('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  },

  updateCourse: async (id, courseData) => {
    return apiCall(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
  },

  deleteCourse: async (id) => {
    return apiCall(`/courses/${id}`, {
      method: 'DELETE'
    });
  },

  getCourseSubjects: async (id) => {
    return apiCall(`/courses/${id}/subjects`);
  },

  addSubjectToCourse: async (courseId, subjectId) => {
    return apiCall(`/courses/${courseId}/subjects/${subjectId}`, {
      method: 'POST'
    });
  },

  removeSubjectFromCourse: async (courseId, subjectId) => {
    return apiCall(`/courses/${courseId}/subjects/${subjectId}`, {
      method: 'DELETE'
    });
  }
};

export default courseService;
