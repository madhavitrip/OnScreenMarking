import React, { useState, useEffect } from 'react';

export default function UniversityManagement() {
  const [universities, setUniversities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    universityName: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'https://localhost:7243/api';

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/universities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUniversities(data);
    } catch (err) {
      setError('Failed to fetch universities');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `${API_URL}/universities/${editingId}`
        : `${API_URL}/universities`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({ universityName: '', isActive: true });
        setEditingId(null);
        setShowForm(false);
        fetchUniversities();
      } else {
        setError('Failed to save university');
      }
    } catch (err) {
      setError('Error saving university');
    }
  };

  const handleEdit = (university) => {
    setFormData({
      universityName: university.universityName,
      isActive: university.isActive
    });
    setEditingId(university.universityId);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ universityName: '', isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Universities</h1>
              <p className="text-slate-400">Manage all universities in the system</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              {showForm ? 'Cancel' : '+ Add University'}
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
                {editingId ? 'Edit University' : 'Add New University'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    University Name
                  </label>
                  <input
                    type="text"
                    value={formData.universityName}
                    onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter university name"
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

          {/* Universities List */}
          <div className="bg-slate-700 rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading...</div>
            ) : universities.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No universities found. Create one to get started!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Created</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {universities.map((university) => (
                      <tr key={university.universityId} className="border-t border-slate-600 hover:bg-slate-600 transition">
                        <td className="px-6 py-4 text-white">{university.universityName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            university.isActive 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {university.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(university.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleEdit(university)}
                            className="text-blue-400 hover:text-blue-300 mr-4 font-semibold"
                          >
                            Edit
                          </button>
                          <a
                            href={`/admin/departments?universityId=${university.universityId}`}
                            className="text-green-400 hover:text-green-300 font-semibold"
                          >
                            View Departments
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
