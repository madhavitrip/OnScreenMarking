import React, { useState, useEffect } from 'react';

export default function SessionProjectManagement() {
  const [activeTab, setActiveTab] = useState('sessions');
  const [sessions, setSessions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    sessionName: '',
    projectName: '',
    sessionId: '',
    universityId: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'https://localhost:7243/api';

  useEffect(() => {
    fetchSessions();
    fetchProjects();
    fetchUniversities();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/session`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      console.error('Failed to fetch sessions');
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/project`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects');
    }
  };

  const fetchUniversities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/universities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUniversities(data);
    } catch (err) {
      console.error('Failed to fetch universities');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (activeTab === 'sessions') {
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId 
          ? `${API_URL}/session/${editingId}`
          : `${API_URL}/session`;

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            sessionName: formData.sessionName,
            isActive: formData.isActive
          })
        });

        if (response.ok) {
          fetchSessions();
          setFormData({ sessionName: '', projectName: '', sessionId: '', universityId: '', isActive: true });
          setEditingId(null);
          setShowForm(false);
        }
      } else {
        if (!formData.sessionId || !formData.universityId) {
          setError('Please select session and university');
          return;
        }

        const method = editingId ? 'PUT' : 'POST';
        const url = editingId 
          ? `${API_URL}/project/${editingId}`
          : `${API_URL}/project`;

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            projectName: formData.projectName,
            sessionId: parseInt(formData.sessionId),
            universityId: parseInt(formData.universityId),
            isActive: formData.isActive
          })
        });

        if (response.ok) {
          fetchProjects();
          setFormData({ sessionName: '', projectName: '', sessionId: '', universityId: '', isActive: true });
          setEditingId(null);
          setShowForm(false);
        }
      }
    } catch (err) {
      setError('Error saving data');
    }
  };

  const handleEdit = (item) => {
    if (activeTab === 'sessions') {
      setFormData({
        sessionName: item.sessionName,
        projectName: '',
        sessionId: '',
        universityId: '',
        isActive: item.isActive
      });
    } else {
      setFormData({
        sessionName: '',
        projectName: item.projectName,
        sessionId: item.sessionId,
        universityId: item.universityId,
        isActive: item.isActive
      });
    }
    setEditingId(item.sessionId || item.projectId);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ sessionName: '', projectName: '', sessionId: '', universityId: '', isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Sessions & Projects</h1>
              <p className="text-slate-400">Manage exam sessions and projects</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              {showForm ? 'Cancel' : `+ Add ${activeTab === 'sessions' ? 'Session' : 'Project'}`}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => {
                setActiveTab('sessions');
                setShowForm(false);
              }}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'sessions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Sessions
            </button>
            <button
              onClick={() => {
                setActiveTab('projects');
                setShowForm(false);
              }}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'projects'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Projects
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
                {editingId ? 'Edit' : 'Add New'} {activeTab === 'sessions' ? 'Session' : 'Project'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'sessions' ? (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-2">
                      Session Name
                    </label>
                    <input
                      type="text"
                      value={formData.sessionName}
                      onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                      className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2024-2025"
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-2">
                        Session
                      </label>
                      <select
                        value={formData.sessionId}
                        onChange={(e) => setFormData({ ...formData, sessionId: e.target.value })}
                        className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Session</option>
                        {sessions.map((session) => (
                          <option key={session.sessionId} value={session.sessionId}>
                            {session.sessionName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-2">
                        University
                      </label>
                      <select
                        value={formData.universityId}
                        onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                        className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select University</option>
                        {universities.map((uni) => (
                          <option key={uni.universityId} value={uni.universityId}>
                            {uni.universityName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-2">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={formData.projectName}
                        onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                        className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Mid-Term Exam"
                        required
                      />
                    </div>
                  </>
                )}
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

          {/* List */}
          <div className="bg-slate-700 rounded-lg overflow-hidden">
            {activeTab === 'sessions' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session.sessionId} className="border-t border-slate-600 hover:bg-slate-600 transition">
                        <td className="px-6 py-4 text-white">{session.sessionName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            session.isActive 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {session.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleEdit(session)}
                            className="text-blue-400 hover:text-blue-300 font-semibold"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Session</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">University</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.projectId} className="border-t border-slate-600 hover:bg-slate-600 transition">
                        <td className="px-6 py-4 text-white">{project.projectName}</td>
                        <td className="px-6 py-4 text-slate-300">
                          {sessions.find(s => s.sessionId === project.sessionId)?.sessionName}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {universities.find(u => u.universityId === project.universityId)?.universityName}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            project.isActive 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {project.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleEdit(project)}
                            className="text-blue-400 hover:text-blue-300 mr-4 font-semibold"
                          >
                            Edit
                          </button>
                          <a
                            href={`/admin/papers?projectId=${project.projectId}`}
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
