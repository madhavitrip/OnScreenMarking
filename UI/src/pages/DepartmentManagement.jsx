import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import departmentService from '../services/departmentService';
import universityService from '../services/universityService';

export default function DepartmentManagement() {
  const [searchParams] = useSearchParams();
  const universityId = searchParams.get('universityId');

  const userType = localStorage.getItem('userType');
  const userUniversityId = localStorage.getItem('universityId');

  // For coordinators, use their university ID; for admins, use URL param
  const activeUniversityId = userType === 'coordinator' ? userUniversityId : universityId;

  const [departments, setDepartments] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    universityId: activeUniversityId || '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUniversities();
    if (activeUniversityId) {
      fetchDepartments(activeUniversityId);
    }
  }, [activeUniversityId]);

  const fetchUniversities = async () => {
    try {
      setLoadingUniversities(true);
      const data = await universityService.getAllUniversities();
      setUniversities(data);
    } catch (err) {
      console.error('Failed to fetch universities:', err);
      setError('Failed to load universities');
    } finally {
      setLoadingUniversities(false);
    }
  };

  const fetchDepartments = async (uniId) => {
    try {
      setLoading(true);
      const data = await departmentService.getDepartmentsByUniversity(uniId);
      setDepartments(data);
    } catch (err) {
      setError('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.universityId) {
      setError('Please select a university');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        universityId: parseInt(formData.universityId, 10)
      };

      if (editingId) {
        await departmentService.updateDepartment(editingId, payload);
        setSuccess('Department updated successfully');
      } else {
        await departmentService.createDepartment(payload);
        setSuccess('Department created successfully');
      }
      setFormData({ name: '', universityId: universityId || '', isActive: true });
      setEditingId(null);
      setShowForm(false);
      if (formData.universityId) {
        fetchDepartments(formData.universityId);
      }
    } catch (err) {
      setError(err.message || 'Failed to save department');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (department) => {
    setFormData({
      name: department.name,
      universityId: department.universityId,
      isActive: department.isActive
    });
    setEditingId(department.departmentId);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ name: '', universityId: activeUniversityId || '', isActive: true });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleUniversityChange = (e) => {
    const uniId = e.target.value;
    setFormData({ ...formData, universityId: uniId });
    if (uniId) {
      fetchDepartments(uniId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Departments</h1>
              <p className="text-gray-600">Manage departments within universities</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
            >
              {showForm ? 'Cancel' : '+ Add Department'}
            </button>
          </div>

          {/* Notifications */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingId ? 'Edit Department' : 'Add New Department'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {userType === 'admin' ? (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      University ({universities.length} available)
                    </label>
                    {loadingUniversities ? (
                      <div className="w-full bg-gray-50 border border-gray-200 text-gray-400 px-4 py-2 rounded-lg">
                        Loading universities...
                      </div>
                    ) : universities.length === 0 ? (
                      <div className="w-full bg-gray-50 border border-gray-200 text-gray-400 px-4 py-2 rounded-lg">
                        No universities available
                      </div>
                    ) : (
                      <select
                        value={formData.universityId}
                        onChange={handleUniversityChange}
                        className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      >
                        <option value="">Select University</option>
                        {universities.map((uni) => {
                          return (
                            <option key={uni.universityId} value={uni.universityId}>
                              {uni.universityName || 'Unnamed'}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      University
                    </label>
                    <div className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                      {universities.find(u => u.universityId === parseInt(userUniversityId))?.universityName || 'Your University'}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter department name"
                    required
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="isActive" className="text-gray-700 font-semibold">Active</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Departments List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {loading && !showForm ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : departments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {universityId ? 'No departments found. Create one to get started!' : 'Select a university to view departments'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">University</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {departments.map((department) => (
                      <tr key={department.departmentId} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-gray-900 font-medium">{department.name}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {universities.find(u => u.universityId === department.universityId)?.universityName}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            department.isActive 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {department.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleEdit(department)}
                            className="text-blue-600 hover:text-blue-800 mr-4 font-semibold"
                          >
                            Edit
                          </button>
                          <a
                            href={`/admin/subjects?departmentId=${department.departmentId}`}
                            className="text-green-600 hover:text-green-800 font-semibold"
                          >
                            View Subjects
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
}
