import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import courseService from '../services/courseService';
import departmentService from '../services/departmentService';
import subjectService from '../services/subjectService';
import UniversityConfigHeader from '../components/UniversityConfigHeader';
import { 
  GraduationCap, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Edit2, 
  Trash2, 
  Plus, 
  BookOpen, 
  X,
  Info,
  Check
} from 'lucide-react';

export default function CourseManagement() {
  const [searchParams] = useSearchParams();
  const universityId = searchParams.get('universityId');
  const { userType, universityId: userUniversityId } = useAuth();
  const activeUniversityId = userType === 'coordinator' ? userUniversityId : universityId;

  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'UG',
    departmentId: '',
    isActive: true
  });

  // Subject Mapping State
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignedSubjects, setAssignedSubjects] = useState([]);

  useEffect(() => {
    if (activeUniversityId) {
      fetchCoursesAndDepartments();
    }
  }, [activeUniversityId]);

  const fetchCoursesAndDepartments = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch departments first to populate selects
      const depts = await departmentService.getDepartmentsByUniversity(activeUniversityId);
      setDepartments(depts);

      // Fetch courses
      const courseList = await courseService.getAllCourses(null, activeUniversityId);
      setCourses(courseList);

      // Fetch all subjects for association
      const subjects = await subjectService.getSubjectByUniversity(activeUniversityId);
      setAllSubjects(subjects);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch courses or departments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setFormData({
      name: course.name,
      type: course.type || 'UG',
      departmentId: course.departmentId,
      isActive: course.isActive
    });
    setEditingId(course.id);
    setShowFormModal(true);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      type: 'UG',
      departmentId: departments[0]?.departmentId || '',
      isActive: true
    });
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Course name is required.');
      return;
    }
    if (!formData.departmentId) {
      setError('Please select a department.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (editingId) {
        await courseService.updateCourse(editingId, formData);
        setSuccess('Course updated successfully!');
      } else {
        await courseService.createCourse(formData);
        setSuccess('Course created successfully!');
      }
      setShowFormModal(false);
      fetchCoursesAndDepartments();
      
      // Clear success message after 3s
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save course.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? All associated data will be removed.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      await courseService.deleteCourse(courseId);
      setSuccess('Course deleted successfully!');
      fetchCoursesAndDepartments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to delete course.');
    } finally {
      setLoading(false);
    }
  };

  // Many-to-Many Subject Assignment
  const handleOpenSubjectModal = async (course) => {
    setSelectedCourse(course);
    setError('');
    try {
      setLoading(true);
      const subjects = await courseService.getCourseSubjects(course.id);
      setAssignedSubjects(subjects.map(s => s.subjectId));
      setShowSubjectModal(true);
    } catch (err) {
      console.error(err);
      setError('Failed to load subjects for this course.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubject = async (subjectId) => {
    const isAssigned = assignedSubjects.includes(subjectId);
    try {
      setError('');
      if (isAssigned) {
        await courseService.removeSubjectFromCourse(selectedCourse.id, subjectId);
        setAssignedSubjects(prev => prev.filter(id => id !== subjectId));
      } else {
        await courseService.addSubjectToCourse(selectedCourse.id, subjectId);
        setAssignedSubjects(prev => [...prev, subjectId]);
      }
      fetchCoursesAndDepartments();
    } catch (err) {
      console.error(err);
      setError('Failed to update subject mapping.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* University Header Navigation */}
        <UniversityConfigHeader />

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-widest mb-1.5">
              <Layers size={14} />
              <span>Academic Programs</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Courses Management</h1>
            <p className="text-slate-500 text-xs mt-1">Configure degrees, branches, and map subjects to academic courses</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg self-start sm:self-center shrink-0"
          >
            <Plus size={16} />
            <span>Add New Course</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-700 px-5 py-4 rounded-2xl text-xs font-semibold shadow-sm animate-fade-in">
            <XCircle size={16} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-700 px-5 py-4 rounded-2xl text-xs font-semibold shadow-sm animate-fade-in">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        {/* Main List */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {loading && courses.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-bold text-xs flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span>Fetching courses...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="p-16 text-center text-slate-500 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
                <GraduationCap size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">No Courses Configured</h3>
                <p className="text-xs text-slate-400">Establish degrees or branches of study to associate with subjects.</p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition cursor-pointer"
              >
                Create Your First Course
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-450 uppercase tracking-widest select-none">
                    <th className="px-6 py-4">Course Info</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Level</th>
                    <th className="px-6 py-4">Subjects Mapping</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 font-extrabold shadow-sm">
                            <GraduationCap size={18} />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 tracking-tight block">{course.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">ID: CRS-{course.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-bold text-[10px] uppercase tracking-wide">
                          {course.department?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-1.5 rounded-lg font-extrabold text-[10px] uppercase ${
                          course.type === 'PG' 
                            ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                            : course.type === 'Diploma' 
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {course.type || 'UG'}
                        </span>
                      </td>
                      <td className="px-6 py-5 max-w-xs">
                        {course.courseSubjects && course.courseSubjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {course.courseSubjects.map((cs) => (
                              <span 
                                key={cs.id}
                                className="px-2 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md font-bold text-[9px] uppercase tracking-wider"
                              >
                                {cs.subject?.subCode || cs.subject?.subName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium text-[10px]">No subjects mapped</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[9px] uppercase tracking-wider border ${
                          course.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${course.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {course.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenSubjectModal(course)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-55 text-indigo-700 border border-indigo-150 hover:bg-indigo-100 hover:text-indigo-800 rounded-xl font-bold text-[10px] uppercase tracking-wider transition cursor-pointer"
                          >
                            <BookOpen size={12} />
                            <span>Map Subjects</span>
                          </button>
                          <button
                            onClick={() => handleEdit(course)}
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition cursor-pointer"
                            title="Edit Course"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-100 transition cursor-pointer"
                            title="Delete Course"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Course Modal Form */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden animate-zoom-in">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-950 uppercase tracking-wider">
                {editingId ? 'Edit Academic Course' : 'Create New Course'}
              </h2>
              <button 
                onClick={() => setShowFormModal(false)}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-950 hover:border-slate-300 transition flex items-center justify-center cursor-pointer shadow-sm"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Course Title / Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bachelor of Computer Applications"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Degree Level</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition cursor-pointer"
                  >
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                    <option value="Diploma">Diploma</option>
                    <option value="PhD">Doctorate (PhD)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData(prev => ({ ...prev, departmentId: parseInt(e.target.value, 10) }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition cursor-pointer"
                  >
                    {departments.map((d) => (
                      <option key={d.departmentId} value={d.departmentId}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-150/70 select-none">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-indigo-650 border-slate-200 rounded focus:ring-indigo-500 focus:outline-none cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Activate this course for registrations and mapping
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-650 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Mapping Modal */}
      {showSubjectModal && selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-lg w-full overflow-hidden animate-zoom-in">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-0.5">Subject Association</span>
                <h2 className="text-base font-black text-slate-950 uppercase tracking-wider leading-none">
                  {selectedCourse.name}
                </h2>
              </div>
              <button 
                onClick={() => setShowSubjectModal(false)}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-950 hover:border-slate-300 transition flex items-center justify-center cursor-pointer shadow-sm"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl text-[11px] text-blue-700 font-semibold shadow-sm">
                <Info size={16} className="shrink-0 text-blue-500 mt-0.5" />
                <p>Toggle subjects below to immediately map or unmap them from the program. Mapped subjects will appear in curriculum selection.</p>
              </div>

              <div className="max-h-[300px] overflow-y-auto border border-slate-100 rounded-2xl divide-y divide-slate-100">
                {allSubjects.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-bold text-xs uppercase tracking-wide">
                    No subjects exist for mapping
                  </div>
                ) : (
                  allSubjects.map((subject) => {
                    const isAssigned = assignedSubjects.includes(subject.subjectId);
                    return (
                      <div 
                        key={subject.subjectId}
                        onClick={() => handleToggleSubject(subject.subjectId)}
                        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/80 transition-colors ${
                          isAssigned ? 'bg-indigo-50/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                            isAssigned 
                              ? 'bg-indigo-600 border-indigo-600 text-white' 
                              : 'bg-white border-slate-200 text-transparent'
                          }`}>
                            <Check size={14} strokeWidth={3} />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block leading-tight">{subject.subName}</span>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mt-0.5">{subject.subCode}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-md font-bold text-[9px] uppercase border ${
                          isAssigned 
                            ? 'bg-indigo-50 border-indigo-150 text-indigo-700' 
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          {isAssigned ? 'Assigned' : 'Not Assigned'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md hover:shadow-lg"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
