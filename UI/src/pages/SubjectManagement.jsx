import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, Plus } from 'lucide-react';
import subjectService from '../services/subjectService';
import departmentService from '../services/departmentService';

export default function SubjectManagement() {
  const [searchParams] = useSearchParams();
  const departmentId = searchParams.get('departmentId');
  const universityId = searchParams.get('universityId');
  const userType = localStorage.getItem('userType');
  const userUniversityId = localStorage.getItem('universityId');
  const activeUniversityId = userType === 'coordinator' ? userUniversityId : universityId;

  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedSubject, setExpandedSubject] = useState(null);

  useEffect(() => {
    fetchDepartments();
    if (departmentId) {
      fetchSubjects(departmentId);
    } else {
      fetchAllSubjects();
    }
  }, [departmentId, activeUniversityId]);

  const fetchDepartments = async () => {
    try {
      const data = activeUniversityId
        ? await departmentService.getDepartmentsByUniversity(activeUniversityId)
        : await departmentService.getAllDepartments();
      setDepartments(data);
    } catch (err) {
      console.error('Failed to fetch departments');
    }
  };

  const fetchAllSubjects = async () => {
    try {
      setLoading(true);
      const data = activeUniversityId
        ? await subjectService.getSubjectByUniversity(activeUniversityId)
        : await subjectService.getAllSubjects();
      setSubjects(data);
    } catch (err) {
      setError('Failed to fetch subjects');
    } finally {
      setLoading(false);
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

  const fetchSubjectDepartments = async (subjectId) => {
    try {
      const data = await subjectService.getSubjectDepartments(subjectId, activeUniversityId);
      return data;
    } catch (err) {
      console.error('Failed to fetch subject departments:', err);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedDepartments.length === 0) {
      setError('Please select at least one department');
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        // Update subject details
        const updatePayload = {
          subjectName: formData.subjectName,
          subjectCode: formData.subjectCode,
          isActive: formData.isActive,
          departmentId: selectedDepartments[0] // Send first department for compatibility
        };
        await subjectService.updateSubject(editingId, updatePayload);

        // Synchronize many-to-many department mappings
        const existingDepts = await fetchSubjectDepartments(editingId);
        const existingDeptIds = existingDepts.map(d => d.departmentId);

        // Add newly selected departments
        for (const deptId of selectedDepartments) {
          if (!existingDeptIds.includes(deptId)) {
            try {
              await subjectService.addDepartmentToSubject(editingId, deptId);
            } catch (err) {
              console.error(`Failed to add department ${deptId}:`, err);
            }
          }
        }

        // Remove unselected departments
        for (const deptId of existingDeptIds) {
          if (!selectedDepartments.includes(deptId)) {
            try {
              await subjectService.removeDepartmentFromSubject(editingId, deptId);
            } catch (err) {
              console.error(`Failed to remove department ${deptId}:`, err);
            }
          }
        }

        setSuccess('Subject updated successfully');
      } else {
        // Create subject with first department
        const createPayload = {
          subjectName: formData.subjectName,
          subjectCode: formData.subjectCode,
          isActive: formData.isActive,
          departmentId: selectedDepartments[0]
        };
        const newSubject = await subjectService.createSubject(createPayload);
        
        // Add remaining departments to subject
        for (let i = 1; i < selectedDepartments.length; i++) {
          try {
            await subjectService.addDepartmentToSubject(newSubject.subjectId, selectedDepartments[i]);
          } catch (err) {
            console.error(`Failed to add department ${selectedDepartments[i]}:`, err);
          }
        }
        setSuccess('Subject created successfully');
      }
      
      setFormData({ subjectName: '', subjectCode: '', isActive: true });
      setSelectedDepartments([]);
      setEditingId(null);
      setShowForm(false);
      fetchDepartments();
      
      if (departmentId) {
        fetchSubjects(departmentId);
      } else {
        fetchAllSubjects();
      }
    } catch (err) {
      setError(err.message || 'Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (subject) => {
    const depts = await fetchSubjectDepartments(subject.subjectId);
    
    // If the subject has departments, filter the available departments list by their university
    const subjectUniId = depts[0]?.universityId;
    if (subjectUniId) {
      try {
        const uniDepts = await departmentService.getDepartmentsByUniversity(subjectUniId);
        setDepartments(uniDepts);
      } catch (err) {
        console.error('Failed to fetch university departments on edit:', err);
      }
    } else if (activeUniversityId) {
      try {
        const uniDepts = await departmentService.getDepartmentsByUniversity(activeUniversityId);
        setDepartments(uniDepts);
      } catch (err) {
        console.error('Failed to fetch departments on edit:', err);
      }
    } else {
      try {
        const allDepts = await departmentService.getAllDepartments();
        setDepartments(allDepts);
      } catch (err) {
        console.error('Failed to fetch all departments on edit:', err);
      }
    }

    setFormData({
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode || '',
      isActive: subject.isActive
    });
    setSelectedDepartments(depts.map(d => d.departmentId));
    setEditingId(subject.subjectId);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ subjectName: '', subjectCode: '', isActive: true });
    setSelectedDepartments([]);
    setEditingId(null);
    setShowForm(false);
    setError('');
    fetchDepartments();
  };

  const toggleDepartment = (deptId) => {
    setSelectedDepartments(prev =>
      prev.includes(deptId)
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };

  const getDepartmentNames = (deptIds) => {
    return deptIds
      .map(id => departments.find(d => d.departmentId === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subjects</h1>
            <p className="text-gray-600">Manage subjects across departments</p>
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

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Subject Code
                </label>
                <input
                  type="text"
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                  className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter subject code"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-3">
                  Departments ({selectedDepartments.length} selected)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {departments.length === 0 ? (
                    <p className="text-gray-500 col-span-2">No departments available</p>
                  ) : (
                    departments.map((dept) => (
                      <label key={dept.departmentId} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDepartments.includes(dept.departmentId)}
                          onChange={() => toggleDepartment(dept.departmentId)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-gray-700">{dept.name}</span>
                      </label>
                    ))
                  )}
                </div>
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
            <p className="text-gray-600 text-lg mb-4">No subjects found</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Create First Subject
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Code</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Departments</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subjects.map((subject) => (
                    <tr key={subject.subjectId} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-900 font-medium">{subject.subjectName}</td>
                      <td className="px-6 py-4 text-gray-600">{subject.subjectCode || '-'}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <button
                          onClick={() => setExpandedSubject(expandedSubject === subject.subjectId ? null : subject.subjectId)}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          View Departments
                        </button>
                        {expandedSubject === subject.subjectId && (
                          <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                            {subject.departmentSubjects && subject.departmentSubjects.length > 0 ? (
                              <ul className="space-y-1">
                                {subject.departmentSubjects.map((ds) => (
                                  <li key={ds.id} className="text-sm text-gray-700">
                                    • {ds.department?.name}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-600">No departments assigned</p>
                            )}
                          </div>
                        )}
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
                          href={`/admin/papers?subjectId=${subject.subjectId}&universityId=${activeUniversityId}`}
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
