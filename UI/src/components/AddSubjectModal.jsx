import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import subjectService from '../services/subjectService';

export default function AddSubjectModal({
  isOpen,
  onClose,
  onSuccess,
  editingId,
  initialData,
  activeUniversityId,
  departments
}) {
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [status, setStatus] = useState(true);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch subject department mapping on edit
  useEffect(() => {
    const loadSubjectDepartments = async () => {
      if (editingId) {
        try {
          const depts = await subjectService.getSubjectDepartments(editingId, activeUniversityId);
          setSelectedDepartments(depts.map(d => d.departmentId));
        } catch (err) {
          console.error('Failed to load subject departments:', err);
        }
      }
    };

    if (editingId && initialData) {
      setSubName(initialData.subName || '');
      setSubCode(initialData.subCode || '');
      setStatus(initialData.status !== undefined ? initialData.status : true);
      loadSubjectDepartments();
    } else {
      setSubName('');
      setSubCode('');
      setStatus(true);
      setSelectedDepartments(initialData?.departmentId ? [parseInt(initialData.departmentId)] : []);
    }
    setError('');
  }, [editingId, initialData, isOpen, activeUniversityId]);

  if (!isOpen) return null;

  const toggleDepartment = (deptId) => {
    setSelectedDepartments(prev =>
      prev.includes(deptId)
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subName.trim()) {
      setError('Subject name is required');
      return;
    }
    if (selectedDepartments.length === 0) {
      setError('Please select at least one department');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (editingId) {
        // Update subject details
        const updatePayload = {
          subjectName: subName.trim(),
          subjectCode: subCode.trim(),
          isActive: status,
          departmentId: selectedDepartments[0]
        };
        await subjectService.updateSubject(editingId, updatePayload);

        // Sync departments
        const existingDepts = await subjectService.getSubjectDepartments(editingId, activeUniversityId);
        const existingDeptIds = existingDepts.map(d => d.departmentId);

        // Add
        for (const deptId of selectedDepartments) {
          if (!existingDeptIds.includes(deptId)) {
            await subjectService.addDepartmentToSubject(editingId, deptId);
          }
        }

        // Remove
        for (const deptId of existingDeptIds) {
          if (!selectedDepartments.includes(deptId)) {
            await subjectService.removeDepartmentFromSubject(editingId, deptId);
          }
        }

        onSuccess('Subject updated successfully');
      } else {
        // Create subject
        const createPayload = {
          subjectName: subName.trim(),
          subjectCode: subCode.trim(),
          isActive: status,
          departmentId: selectedDepartments[0]
        };
        const newSubject = await subjectService.createSubject(createPayload);

        // Add remaining departments
        for (let i = 1; i < selectedDepartments.length; i++) {
          await subjectService.addDepartmentToSubject(newSubject.subjectId, selectedDepartments[i]);
        }

        onSuccess('Subject created successfully');
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl border border-slate-100 transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {editingId ? 'Edit Subject' : 'Add New Subject'}
            </h3>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-50 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl border border-red-100 font-semibold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. Data Structures"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Subject Code
                </label>
                <input
                  type="text"
                  value={subCode}
                  onChange={(e) => setSubCode(e.target.value)}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. CS-201"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Departments ({selectedDepartments.length} selected)
              </label>
              <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-40 overflow-y-auto">
                {departments.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium col-span-2 py-2 text-center">No departments available</p>
                ) : (
                  departments.map((dept) => (
                    <label key={dept.departmentId} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDepartments.includes(dept.departmentId)}
                        onChange={() => toggleDepartment(dept.departmentId)}
                        className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-[11px] font-semibold text-slate-700 leading-none">{dept.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-3 border-t border-slate-100 mt-5">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white font-extrabold text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingId ? 'Update Subject' : 'Create Subject'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
