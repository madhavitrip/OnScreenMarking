import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, ClipboardList, Plus } from 'lucide-react';
import apiCall from '../services/api';
import { encryptId } from '../utils/encryption';
import { useBreadcrumb } from '../context/BreadcrumbContext';

export default function SessionProjectManagement() {
  const [searchParams] = useSearchParams();
  const universityId = searchParams.get('universityId');
  const { setBreadcrumb } = useBreadcrumb();

  const [sessions, setSessions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    sessionName: '',
    projectName: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Set breadcrumb for this page
    setBreadcrumb([
      { label: 'Sessions & Projects', path: '/admin/sessions', icon: 'Calendar' }
    ]);
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      fetchProjects(selectedSessionId);
    }
  }, [selectedSessionId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/session');
      setSessions(data);
    } catch (err) {
      setError('Failed to fetch sessions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async (sessionId) => {
    try {
      const data = await apiCall('/project');
      // Filter projects by session and university if provided
      const filtered = data.filter(p => p.sessionId === sessionId && (!universityId || p.universityId === parseInt(universityId)));
      setProjects(filtered);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error(err);
    }
  };

  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/session/${editingId}` : '/session';

      await apiCall(url, {
        method,
        body: JSON.stringify({
          sessionName: formData.sessionName,
          isActive: formData.isActive
        })
      });

      fetchSessions();
      setFormData({ sessionName: '', projectName: '', isActive: true });
      setEditingId(null);
      setShowSessionForm(false);
    } catch (err) {
      setError('Error saving session');
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSessionId) {
      setError('Please select a session first');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/project/${editingId}` : '/project';

      await apiCall(url, {
        method,
        body: JSON.stringify({
          projectName: formData.projectName,
          sessionId: selectedSessionId,
          universityId: universityId ? parseInt(universityId) : 1,
          isActive: formData.isActive
        })
      });

      fetchProjects(selectedSessionId);
      setFormData({ sessionName: '', projectName: '', isActive: true });
      setEditingId(null);
      setShowProjectForm(false);
    } catch (err) {
      setError('Error saving project');
    }
  };

  const handleEditSession = (session) => {
    setFormData({
      sessionName: session.sessionName,
      projectName: '',
      isActive: session.isActive
    });
    setEditingId(session.sessionId);
    setShowSessionForm(true);
  };

  const handleEditProject = (project) => {
    setFormData({
      sessionName: '',
      projectName: project.projectName,
      isActive: project.isActive
    });
    setEditingId(project.projectId);
    setShowProjectForm(true);
  };

  const handleCancel = () => {
    setFormData({ sessionName: '', projectName: '', isActive: true });
    setEditingId(null);
    setShowSessionForm(false);
    setShowProjectForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-6">
          <h1 className="text-2xl font-bold text-gray-900">Sessions & Projects</h1>
          <p className="text-gray-500 text-sm mt-1">Select a session to view and manage its projects</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-900 text-sm">
            {error}
          </div>
        )}

        {/* Sessions Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Calendar size={20} />
              Sessions
            </h2>
            <button
              onClick={() => setShowSessionForm(!showSessionForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus size={16} />
              Add Session
            </button>
          </div>

          {/* Session Form */}
          {showSessionForm && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                {editingId ? 'Edit Session' : 'Add New Session'}
              </h3>
              <form onSubmit={handleSessionSubmit} className="space-y-3">
                <div>
                  <label className="block text-gray-700 text-xs font-semibold mb-1">
                    Session Name
                  </label>
                  <input
                    type="text"
                    value={formData.sessionName}
                    onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2024-2025"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label className="ml-2 text-gray-700 text-sm">Active</label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sessions Grid */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Calendar className="mx-auto text-gray-400 mb-3" size={32} />
              <p className="text-gray-600 text-sm font-semibold">No sessions yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  onClick={() => setSelectedSessionId(session.sessionId)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSessionId === session.sessionId
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{session.sessionName}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      session.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {session.isActive ? 'Active' : 'Off'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSession(session);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-xs font-semibold"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects Section */}
        {selectedSessionId && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ClipboardList size={20} />
                Projects for {sessions.find(s => s.sessionId === selectedSessionId)?.sessionName}
              </h2>
              <button
                onClick={() => setShowProjectForm(!showProjectForm)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <Plus size={16} />
                Add Project
              </button>
            </div>

            {/* Project Form */}
            {showProjectForm && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  {editingId ? 'Edit Project' : 'Add New Project'}
                </h3>
                <form onSubmit={handleProjectSubmit} className="space-y-3">
                  <div>
                    <label className="block text-gray-700 text-xs font-semibold mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Mid-Term Exam"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label className="ml-2 text-gray-700 text-sm">Active</label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      {editingId ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Projects Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {projects.length === 0 ? (
                <div className="p-8 text-center">
                  <ClipboardList className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-gray-600 text-sm font-semibold">No projects for this session</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-700 text-xs font-bold uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-gray-700 text-xs font-bold uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-gray-700 text-xs font-bold uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {projects.map((project) => (
                        <tr key={project.projectId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-900 text-sm font-medium">{project.projectName}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              project.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {project.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleEditProject(project)}
                              className="text-blue-600 hover:text-blue-700 font-semibold mr-4"
                            >
                              Edit
                            </button>
                            <a
                              href={`/admin/subject-config?projectId=${encryptId(project.projectId)}`}
                              className="text-purple-600 hover:text-purple-700 font-semibold mr-4"
                            >
                              Configure
                            </a>
                            <a
                              href={`/admin/papers?projectId=${encryptId(project.projectId)}`}
                              className="text-green-600 hover:text-green-700 font-semibold"
                            >
                              Papers
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
        )}
      </div>
    </div>
  );
}
