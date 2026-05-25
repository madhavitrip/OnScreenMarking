import apiCall from './api';

const attendanceService = {
  // Get all attendance records
  getAllAttendance: async (params = {}) => {
    let query = '';
    const queryParts = [];
    if (params.status) {
      queryParts.push(`status=${encodeURIComponent(params.status)}`);
    }
    if (params.date) {
      queryParts.push(`date=${encodeURIComponent(params.date)}`);
    }
    if (queryParts.length > 0) {
      query = '?' + queryParts.join('&');
    }
    return apiCall(`/attendance${query}`);
  },

  // Bulk import attendance records
  bulkImportAttendance: async (attendanceData) => {
    return apiCall('/attendance/bulk-import', {
      method: 'POST',
      body: JSON.stringify(attendanceData)
    });
  },

  // Delete attendance record
  deleteAttendance: async (attendanceId) => {
    return apiCall(`/attendance/${attendanceId}`, {
      method: 'DELETE'
    });
  }
};

export default attendanceService;
