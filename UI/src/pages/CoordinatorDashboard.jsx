import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  FileText, 
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  Activity,
  AlertCircle,
  Zap,
  ArrowUpRight,
  Layers,
  Users,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiCall from '../services/api';
import { encryptId } from '../utils/encryption';
import AddDepartmentModal from '../components/AddDepartmentModal';
import AddSubjectModal from '../components/AddSubjectModal';

export default function CoordinatorDashboard() {
  const { universityId } = useAuth();
  const [university, setUniversity] = useState(null);
  const [stats, setStats] = useState({
    departments: 0,
    subjects: 0,
    projects: 0,
    totalScripts: 0,
    assignedScripts: 0,
    completedScripts: 0
  });
  const [activeProjects, setActiveProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    return localStorage.getItem('selectedProjectId') || '';
  });

  const handleProjectSelect = (id) => {
    setSelectedProjectId(id);
    if (id) {
      localStorage.setItem('selectedProjectId', id);
    } else {
      localStorage.removeItem('selectedProjectId');
    }
  };

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [departmentsList, setDepartmentsList] = useState([]);

  const handleDeptSuccess = (msg) => {
    fetchUniversityData();
  };

  const handleSubSuccess = (msg) => {
    fetchUniversityData();
  };

  useEffect(() => {
    fetchUniversityData();
  }, []);

  const fetchUniversityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Get coordinator's university
      const uniData = await apiCall('/universities/current/my-university');
      setUniversity(uniData);
      
      // 2. Fetch departments and subjects stats
      const deptData = await apiCall(`/department?universityId=${uniData.universityId}`);
      const departmentsArray = Array.isArray(deptData) ? deptData : (deptData?.items || []);
      setDepartmentsList(departmentsArray);
      
      // 3. Fetch all scripts in the system to compute live marking statistics
      let pendingCount = 0;
      let assignedCount = 0;
      let completedCount = 0;
      let totalScriptsCount = 0;
      
      try {
        const scripts = await apiCall('/scripts?limit=5000');
        // Filter scripts belonging to papers in this university's projects
        const universityProjectIds = uniData.projects?.map(p => p.projectId) || [];
        
        // Fetch all papers for university projects to filter scripts
        const papersData = await apiCall(`/papers?universityId=${uniData.universityId}`);
        const universityPaperIds = papersData.map(p => p.paperId);
        
        const universityScripts = scripts.filter(s => universityPaperIds.includes(s.paperId));
        totalScriptsCount = universityScripts.length;
        pendingCount = universityScripts.filter(s => s.status === 'pending').length;
        assignedCount = universityScripts.filter(s => s.status === 'allocated' || s.status === 'marking').length;
        completedCount = universityScripts.filter(s => s.status === 'completed').length;
        
        setUnassignedCount(pendingCount);
      } catch (scriptErr) {
        console.error('Failed to fetch pending scripts:', scriptErr);
      }

      let usersCount = 0;
      try {
        const usersData = await apiCall(`/users?universityId=${uniData.universityId}`);
        usersCount = usersData?.length || 0;
      } catch (userErr) {
        console.error('Failed to fetch university users count:', userErr);
      }

      setStats({
        departments: departmentsArray.length,
        subjects: departmentsArray.reduce((sum, dept) => sum + (dept.departmentSubjects?.length || 0), 0),
        projects: uniData.projects?.length || 0,
        totalScripts: totalScriptsCount,
        assignedScripts: assignedCount,
        completedScripts: completedCount,
        users: usersCount
      });

      // Map projects data
      if (uniData.projects) {
        setActiveProjects(uniData.projects);
      }
    } catch (err) {
      console.error('Failed to fetch university data:', err);
      setError(err.message || 'Failed to load university data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider animate-pulse">Synchronizing Cockpit...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full border border-red-100">
          <div className="flex items-center gap-3 mb-4 text-red-600">
            <AlertCircle size={28} />
            <h2 className="text-lg font-bold">Cockpit Synch Failure</h2>
          </div>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <button 
            onClick={fetchUniversityData}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2.5 rounded-xl hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 w-full px-6 lg:px-10">
      {/* Top Breadcrumb & Alert Bar */}
      <div className="pt-6">
        {unassignedCount > 0 && (
          <div className="mb-6 bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-md shrink-0">
                <AlertCircle size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Attention Required</h3>
                <p className="text-xs text-amber-800 mt-0.5">There are <span className="font-bold text-red-600">{unassignedCount}</span> scripts pending examiner allocation. Please assign them immediately.</p>
              </div>
            </div>
            <Link 
              to="/allocate-scripts" 
              className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-md shrink-0"
            >
              Allocate Scripts
            </Link>
          </div>
        )}
      </div>

      {/* Main Glass Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold mb-1">
            <LayoutDashboard size={14} />
            <span className="uppercase tracking-widest text-[9px] font-extrabold">Board Cockpit</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {university?.universityName} Portal
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">University Examinations & Evaluation Control Room</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-150 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <Activity size={14} />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-400 leading-none mb-0.5">Cockpit Link</p>
              <p className="text-xs font-bold text-slate-950">Active / Encrypted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN - MAIN ANALYTICS AND DETAILS (75% Width) */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          
          {/* Step-by-Step OSM Configuration Guide */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  OSM Onboarding Checklist
                </h2>
                <p className="text-[11px] text-slate-500">A step-by-step setup checklist for University Coordinators to enable paper evaluation</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-100 animate-pulse">
                Self-Guiding Flow
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 mt-2">
              <SetupStep
                step={1}
                title="Board Departments"
                desc="Define academic branches first"
                count={`${stats.departments} Configured`}
                path="/departments"
                isCompleted={stats.departments > 0}
                actionLabel="+ Add Dept"
                onAction={() => setShowDeptModal(true)}
              />
              <SetupStep
                step={2}
                title="Syllabus Subjects"
                desc="Add subjects to departments"
                count={`${stats.subjects} Subjects`}
                path="/subjects"
                isCompleted={stats.subjects > 0}
                actionLabel="+ Add Subject"
                onAction={() => setShowSubModal(true)}
              />
              <SetupStep
                step={3}
                title="Create Projects"
                desc="Launch active evaluation seasons"
                count={`${activeProjects.length} Active`}
                path="/sessions"
                isCompleted={activeProjects.length > 0}
              />
              <SetupStep
                step={4}
                title="User Directory"
                desc="Invite examiners & manage roles"
                count={`${stats.users || 0} Members`}
                path="/users"
                isCompleted={stats.users > 0}
              />
            </div>
          </div>

          {/* Real-time Evaluations Performance Cockpit Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Marking Status & Metric Board</h2>
                <p className="text-[11px] text-slate-500">Real-time script evaluations status for university projects</p>
              </div>
              <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-100">
                Evaluation Statistics
              </span>
            </div>

            {/* Micro Metrics Rows */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Configured Depts</span>
                <span className="text-base font-bold text-slate-900 mt-1">{stats.departments}</span>
              </div>
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total Subjects</span>
                <span className="text-base font-bold text-slate-900 mt-1">{stats.subjects}</span>
              </div>
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total Exam Scripts</span>
                <span className="text-base font-bold text-slate-900 mt-1">{stats.totalScripts}</span>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl text-white flex flex-col justify-between shadow-md shadow-blue-100">
                <span className="text-[9px] uppercase font-bold text-blue-100 tracking-wider">Completed Marking</span>
                <span className="text-base font-bold mt-1">
                  {stats.completedScripts} <span className="text-[10px] font-normal text-blue-200">/ {stats.totalScripts}</span>
                </span>
              </div>
            </div>

            {/* Unified Evaluation Progress Slider */}
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-bold text-slate-700">Marking Evaluation Progress Ratio</span>
                <span className="text-[11px] font-bold text-blue-600">
                  {stats.totalScripts > 0 ? Math.round((stats.completedScripts / stats.totalScripts) * 100) : 0}% Complete
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalScripts > 0 ? (stats.completedScripts / stats.totalScripts) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Active Examination Projects & Progress */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Active Evaluation Projects</h2>
                <p className="text-[11px] text-slate-500">Live projects associated with this university session</p>
              </div>
              <Link to="/sessions" className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                Manage Projects <ArrowUpRight size={12} />
              </Link>
            </div>
            
            {activeProjects.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ClipboardList size={32} className="mx-auto mb-1.5 opacity-20" />
                <p className="text-[10px] font-bold uppercase tracking-wider">No projects launched yet</p>
                <Link to="/sessions" className="text-[10px] text-blue-600 underline font-bold mt-0.5 inline-block">Create first project</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project details</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Created</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {activeProjects.map((project) => (
                      <tr key={project.projectId} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">
                              {project.projectName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-xs text-slate-900 leading-none">{project.projectName}</p>
                              <p className="text-[9px] text-slate-400 uppercase font-bold mt-1 tracking-wider">ID: PROJECT-{project.projectId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            project.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-600"
                          }`}>
                            {project.isActive ? "Active" : "Archived"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[10px] font-bold text-slate-500">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link 
                              to={`/sessions?edit=true&id=${project.projectId}`}
                              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all"
                            >
                              Config
                            </Link>
                            <Link 
                              to={`/allocate-scripts?projectId=${project.projectId}`}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all"
                            >
                              Allocate
                            </Link>
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

        {/* RIGHT COLUMN - SLICK SIDE BAR (25% Width) */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          
          {/* Quick Action Navigation Dock */}
          {/* Quick Action Navigation Dock */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Active Evaluation Cockpit</h3>
            
            {/* Project Selection Dropdown */}
            <div className="mb-4 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
              <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1 block">Active Project Scope</label>
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectSelect(e.target.value)}
                className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="">-- No Project Selected --</option>
                {activeProjects.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <SidebarLink 
                to={selectedProjectId ? `/papers?projectId=${encryptId(selectedProjectId)}` : "#"} 
                label="Question Papers" 
                desc="Setup sections & marking criteria" 
                icon={<FileText size={14} />} 
                color="text-indigo-600 bg-indigo-50" 
                disabled={!selectedProjectId}
              />
              <SidebarLink 
                to={selectedProjectId ? `/allocate-scripts?projectId=${encryptId(selectedProjectId)}` : "#"} 
                label="Script Allocator" 
                desc="Assign scripts to examiners" 
                icon={<Zap size={14} />} 
                color="text-blue-600 bg-blue-50 animate-pulse" 
                disabled={!selectedProjectId}
              />
            </div>
          </div>

          {/* Compact Metadata Details Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">University Profile</h3>
            <div className="space-y-3">
              <div className="border-b border-slate-50 pb-2">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider leading-none">University Name</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{university?.universityName}</p>
              </div>
              <div className="border-b border-slate-50 pb-2">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider leading-none">System Status</span>
                <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active / Serving
                </p>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider leading-none">Active Configs</span>
                <p className="text-[10px] font-semibold text-slate-700 mt-0.5">
                  {stats.departments} Departments | {stats.subjects} Subjects
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Direct Add Department Modal */}
      <AddDepartmentModal
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        onSuccess={handleDeptSuccess}
        activeUniversityId={university?.universityId}
      />

      {/* Direct Add Subject Modal */}
      <AddSubjectModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        onSuccess={handleSubSuccess}
        activeUniversityId={university?.universityId}
        departments={departmentsList}
      />
    </div>
  );
}

const SidebarLink = ({ to, label, desc, icon, color, disabled }) => {
  if (disabled) {
    return (
      <div
        className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 opacity-60 cursor-not-allowed"
        title="Requires Active Project Selection"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-lg bg-slate-200 text-slate-400 shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] font-bold text-slate-400 truncate">{label}</h4>
            <p className="text-[9px] text-slate-400 mt-0.5 truncate">{desc}</p>
          </div>
        </div>
        <span className="text-[8px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5 shrink-0 uppercase tracking-wider">
          🔒 Select Project
        </span>
      </div>
    );
  }

  return (
    <Link
      to={to}
      className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/20 transition-all duration-300"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`p-2 rounded-lg ${color} shrink-0 group-hover:scale-105 transition-transform`}>
          {icon}
        </div>
        <div className="min-w-0">
          <h4 className="text-[11px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{label}</h4>
          <p className="text-[9px] text-slate-400 mt-0.5 truncate">{desc}</p>
        </div>
      </div>
      <ChevronRight size={12} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </Link>
  );
};

const SetupStep = ({ step, title, desc, count, path, isCompleted, actionLabel, onAction }) => {
  return (
    <div
      className={`group p-3.5 rounded-xl border flex flex-col justify-between hover:shadow-md transition-all duration-300 relative bg-white border-slate-100/80`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
            isCompleted
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-blue-50 text-blue-600'
          }`}>
            {step}
          </span>
          <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full ${
            isCompleted
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/60'
              : 'bg-amber-50 text-amber-700 border border-amber-100/60'
          }`}>
            {isCompleted ? 'Completed' : 'Pending'}
          </span>
        </div>
        <h4 className="text-[11px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{title}</h4>
        <p className="text-[9px] text-slate-400 mt-1 leading-tight">{desc}</p>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100/60 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className={`text-[9px] font-extrabold ${isCompleted ? 'text-emerald-700' : 'text-blue-600'}`}>
            {count}
          </span>
          <Link to={path} className="text-[9px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 transition-colors">
            View Page <ChevronRight size={10} />
          </Link>
        </div>

        {actionLabel && onAction && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAction();
            }}
            className="w-full text-center py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow text-white font-extrabold text-[9px] uppercase tracking-wider transition-all cursor-pointer"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
