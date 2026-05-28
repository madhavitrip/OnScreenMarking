import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import departmentService from '../services/departmentService';
import universityService from '../services/universityService';
import SubjectManagement from './SubjectManagement';
import AddDepartmentModal from '../components/AddDepartmentModal';
import AddSubjectModal from '../components/AddSubjectModal';
import UniversityConfigHeader from '../components/UniversityConfigHeader';

export default function DepartmentManagement() {
  const [searchParams] = useSearchParams();
  const universityId = searchParams.get('universityId');
  const { userType, universityId: userUniversityId } = useAuth();

  // For coordinators, use their university ID; for admins, use URL param
  const activeUniversityId = userType === 'coordinator' ? userUniversityId : universityId;

  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    universityId: activeUniversityId,
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  useEffect(() => {
    if (activeUniversityId) {
      fetchDepartments(activeUniversityId);
    }
  }, [activeUniversityId]);


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

  const handleSuccess = (msg) => {
    setSuccess(msg);
    if (activeUniversityId) {
      fetchDepartments(activeUniversityId);
    }
  };


  const handleAddSubject = (department) => {
    setSelectedDepartmentId(department.departmentId);
    setShowSubjectModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* University Sub-navigation Operations Hub */}
        <UniversityConfigHeader />

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

        {/* Form Modal */}
        <AddDepartmentModal
          isOpen={showForm}
          onClose={handleCancel}
          onSuccess={handleSuccess}
          editingId={editingId}
          initialData={formData}
          activeUniversityId={activeUniversityId}
        />

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
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Department Name</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Subjects</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-gray-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {departments.map((department) => (
                    <tr key={department.departmentId} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-900 font-medium">{department.name}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {department.departmentSubjects?.length > 0 ? (
                          department.departmentSubjects.map((ds) => ds.subject?.subName).join(', ')
                        ) : (
                          <span className="text-gray-500">No Subjects</span>
                        )}
                      </td>                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${department.isActive
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                          {department.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <>
                          <button
                            onClick={() => handleEdit(department)}
                            className="text-blue-600 hover:text-blue-800 mr-4 font-semibold"
                          >
                            Edit Dept
                          </button>
                          <button
                            onClick={() => handleAddSubject(department)}
                            className="text-green-600 hover:text-green-800 font-semibold"
                          >
                            Add Subjects
                          </button>

                        </>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <AddSubjectModal
            isOpen={showSubjectModal}
            onClose={() => setShowSubjectModal(false)}
            onSuccess={handleSuccess}
            activeUniversityId={activeUniversityId}
            departments={departments}
            initialData={{ departmentId: selectedDepartmentId }}
          />
        </div>
      </div>
    </div>
  );
}
