import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

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

  const API_URL = 'https://localhost:7243/api';

  useEffect(() => {
    fetchUniversities();
    if (activeUniversityId) {
      fetchDepartments(activeUniversityId);
    }
  }, [activeUniversityId]);

  const fetchUniversities = async () => {
    try {
      setLoadingUniversities(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/universities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        console.error('Failed to fetch universities:', response.status);
        setError('Failed to load universities');
        return;
      }
      const data = await response.json();
      console.log('Universities loaded:', data);
      setUniversities(data);
    } catch (err) {
      console.error('Failed to fetch universities:', err);
      setError('Error loading universities');
    } finally {
      setLoadingUniversities(false);
    }
  };

  const fetchDepartments = async (uniId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/department?universityId=${uniId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
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
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `${API_URL}/department/${editingId}`
        : `${API_URL}/department`;

      // Convert universityId to number
      const payload = {
        ...formData,
        universityId: parseInt(formData.universityId, 10)
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setFormData({ name: '', universityId: universityId || '', isActive: true });
        setEditingId(null);
        setShowForm(false);
        if (formData.universityId) {
          fetchDepartments(formData.universityId);
        }
      } else {
        setError('Failed to save department');
      }
    } catch (err) {
      setError('Error saving department');
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
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Departments</h1>
              <p className="text-slate-500">Manage departments within universities</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              {showForm ? 'Cancel' : '+ Add Department'}
            </button>
          </div>

          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                {editingId ? 'Edit Department' : 'Add New Department'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {userType === 'admin' ? (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-2">
                      University ({universities.length} available)
                    </label>
                    {loadingUniversities ? (
                      <div className="w-full bg-slate-50 border border-slate-200 text-slate-400 px-4 py-2 rounded-lg">
                        Loading universities...
                      </div>
                    ) : universities.length === 0 ? (
                      <div className="w-full bg-slate-50 border border-slate-200 text-slate-400 px-4 py-2 rounded-lg">
                        No universities available
                      </div>
                    ) : (
                      <select
                        value={formData.universityId}
                        onChange={handleUniversityChange}
                        className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-slate-700 font-semibold mb-2">
                      University
                    </label>
                    <div className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2 rounded-lg">
                      {universities.find(u => u.universityId === parseInt(userUniversityId))?.universityName || 'Your University'}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department name"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <label className="ml-2 text-slate-700">Active</label>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                  >
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Departments List */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : departments.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                {universityId ? 'No departments found. Create one to get started!' : 'Select a university to view departments'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-slate-600 font-semibold uppercase text-xs tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-slate-600 font-semibold uppercase text-xs tracking-wider">University</th>
                      <th className="px-6 py-3 text-left text-slate-600 font-semibold uppercase text-xs tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-slate-600 font-semibold uppercase text-xs tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {departments.map((department) => (
                      <tr key={department.departmentId} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-slate-900 font-medium">{department.name}</td>
                        <td className="px-6 py-4 text-slate-600">
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
