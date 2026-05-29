import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import subjectService from '../services/subjectService';
import departmentService from '../services/departmentService';
import AddSubjectModal from '../components/AddSubjectModal';
import UniversityConfigHeader from '../components/UniversityConfigHeader';

export default function SubjectManagement() {
  const [searchParams] = useSearchParams();
  const departmentId = searchParams.get('departmentId');
  const universityId = searchParams.get('universityId');
  const { userType, universityId: userUniversityId } = useAuth();
  const activeUniversityId = userType === 'coordinator' ? userUniversityId : universityId;

  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDepartments, setSelectedDepartments] = useState(
    departmentId ? [parseInt(departmentId)] : []
  );
   const [formData, setFormData] = useState({
    subName: '',
    subCode: '',
    status: true
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
      subName: subject.subName,
      subCode: subject.subCode || '',
      status: subject.status,
      departmentId: depts[0]?.departmentId || ''
    });
    setEditingId(subject.subjectId);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ subName: '', subCode: '', status: true });
    setEditingId(null);
    setShowForm(false);
    setError('');
    fetchDepartments();
  };

  const handleSuccess = (msg) => {
    setSuccess(msg);
    if (departmentId) {
      fetchSubjects(departmentId);
    } else {
      fetchAllSubjects();
    }
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
        {/* University Sub-navigation Operations Hub */}
        <UniversityConfigHeader />

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

        {/* Form Modal */}
        <AddSubjectModal
          isOpen={showForm}
          onClose={handleCancel}
          onSuccess={handleSuccess}
          editingId={editingId}
          initialData={formData}
          activeUniversityId={activeUniversityId}
          departments={departments}
        />

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
                      <td className="px-6 py-4 text-gray-900 font-medium">{subject.subName}</td>
                      <td className="px-6 py-4 text-gray-600">{subject.subCode || '-'}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {subject.departmentSubjects && subject.departmentSubjects.length > 0
                          ? subject.departmentSubjects
                            .map((ds) => ds.department?.name)
                            .join(', ')
                          : 'No departments assigned'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${subject.status
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                          }`}>
                          {subject.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="text-blue-600 hover:text-blue-800 mr-4 font-semibold"
                        >
                          Edit
                        </button>
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
