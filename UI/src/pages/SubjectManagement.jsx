import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import subjectService from '../services/subjectService';
import departmentService from '../services/departmentService';

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
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDepartments();
    if (departmentId) {
      fetchSubjects(departmentId);
    }
  }, [departmentId]);

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getAllDepartments();
      setDepartments(data);
    } catch (err) {
      console.error('Failed to fetch departments');
    }
  };

  const fetchSubjects = async (deptId) => {
    try {
      setLoading(true);
      const data = await subjectService.getSubjectsByDepartment(deptId);
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
      setLoading(true);
      if (editingId) {
        await subjectService.updateSubject(editingId, formData);
        setSuccess('Subject updated successfully');
      } else {
        await subjectService.createSubject(formData);
        setSuccess('Subject created successfully');
      }
      setFormData({ subjectName: '', departmentId: departmentId || '', isActive: true });
      setEditingId(null);
      setShowForm(false);
      if (formData.departmentId) {
        fetchSubjects(formData.departmentId);
      }
    } catch (err) {
      setError(err.message || 'Failed to save subject');
    } finally {
      setLoading(false);
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
    setError('');
  };

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    setFormData({ ...formData, departmentId: deptId });
    if (deptId) {
      fetchSubjects(deptId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subjects</h1>
            <p className="text-gray-600">Manage subjects within departments</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
          >
            {showForm ? 'Cancel' : '+ Add Subject'}
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
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Department
                </label>
                <select
                  value={formData.departmentId}
                  onChange={handleDepartmentChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                <label className="block text-gray-700 font-semibold mb-2">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter subject name"
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded"
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

        {/* Subjects List */}
        {loading && !showForm ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              {departmentId ? 'No subjects found' : 'Select a department to view subjects'}
            </p>
            {departmentId && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Create First Subject
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Department</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subjects.map((subject) => (
                    <tr key={subject.subjectId} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-900">{subject.subjectName}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {departments.find(d => d.departmentId === subject.departmentId)?.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          subject.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {subject.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="text-blue-600 hover:text-blue-800 mr-4 font-semibold"
                        >
                          Edit
                        </button>
                        <a
                          href={`/admin/papers?subjectId=${subject.subjectId}`}
                          className="text-green-600 hover:text-green-800 font-semibold"
                        >
                          View Papers
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
