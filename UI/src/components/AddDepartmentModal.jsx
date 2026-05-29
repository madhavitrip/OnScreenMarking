import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import departmentService from '../services/departmentService';

export default function AddDepartmentModal({
  isOpen,
  onClose,
  onSuccess,
  editingId,
  initialData,
  activeUniversityId
}) {
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingId && initialData) {
      setName(initialData.name || '');
      setIsActive(initialData.isActive !== undefined ? initialData.isActive : true);
    } else {
      setName('');
      setIsActive(true);
    }
    setError('');
  }, [editingId, initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Department name is required');
      return;
    }
    if (!activeUniversityId) {
      setError('No active university selected');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const payload = {
        name: name.trim(),
        universityId: parseInt(activeUniversityId, 10),
        isActive,
        departmentSubjects: []
      };

      if (editingId) {
        await departmentService.updateDepartment(editingId, payload);
      } else {
        await departmentService.createDepartment(payload);
      }

      onSuccess(editingId ? 'Department updated successfully' : 'Department created successfully');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save department');
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
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl border border-slate-100 transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {editingId ? 'Edit Department' : 'Add New Department'}
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

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Department Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. Computer Science"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-3 border-t border-slate-100 mt-5">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white font-extrabold text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingId ? 'Update Department' : 'Create Department'}
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
