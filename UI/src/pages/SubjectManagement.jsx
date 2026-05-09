import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function SubjectManagement() {
  const [searchParams] = useSearchParams();
  const departmentId = searchParams.get('departmentId');

  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    subjectName: '',
    departmentId: departmentId || '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'https://localhost:7243/api';

  useEffect(() => {
    fetchDepartments();
    if (departmentId) {
      fetchSubjects(departmentId);
    }
  }, [departmentId]);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/department`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      console.error('Failed to fetch departments');
    }
  };

  const fetchSubjects = async (deptId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/subject?departmentId=${deptId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      setError('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.departmentId) {
      setError('Please select a department');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `${API_URL}/subject/${editingId}`
        : `${API_URL}/subject`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({ subjectName: '', departmentId: departmentId || '', isActive: true });
        setEditingId(null);
        setShowForm(false);
        if (formData.departmentId) {
          fetchSubjects(formData.departmentId);
        }
      } else {
        setError('Failed to save subject');
      }
    } catch (err) {
      setError('Error saving subject');
    }
  };

  const handleEdit = (subject) => {
    setFormData({
      subjectName: subject.subjectName,
      departmentId: subject.departmentId,
      isActive: subject.isActive
    });
    setEditingId(subject.subjectId);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ subjectName: '', departmentId: departmentId || '', isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    setFormData({ ...formData, departmentId: deptId });
    if (deptId) {
      fetchSubjects(deptId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Subjects</h1>
              <p className="text-slate-400">Manage subjects within departments</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              {showForm ? 'Cancel' : '+ Add Subject'}
            </button>
          </div>

          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="bg-slate-700 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingId ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Department
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={handleDepartmentChange}
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.departmentId} value={dept.departmentId}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter subject name"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <label className="ml-2 text-slate-300">Active</label>
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
                    className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Subjects List */}
          <div className="bg-slate-700 rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading...</div>
            ) : subjects.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                {departmentId ? 'No subjects found. Create one to get started!' : 'Select a department to view subjects'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Department</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject) => (
                      <tr key={subject.subjectId} className="border-t border-slate-600 hover:bg-slate-600 transition">
                        <td className="px-6 py-4 text-white">{subject.subjectName}</td>
                        <td className="px-6 py-4 text-slate-300">
                          {departments.find(d => d.departmentId === subject.departmentId)?.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            subject.isActive 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {subject.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleEdit(subject)}
                            className="text-blue-400 hover:text-blue-300 mr-4 font-semibold"
                          >
                            Edit
                          </button>
                          <a
                            href={`/admin/papers?subjectId=${subject.subjectId}`}
                            className="text-green-400 hover:text-green-300 font-semibold"
                          >
                            View Papers
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
