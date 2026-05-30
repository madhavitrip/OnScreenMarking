import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Layers, 
  FileText, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileSpreadsheet,
  Award,
  BookOpen,
  Calendar,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import { decryptId, encryptId } from '../utils/encryption';
import apiCall from '../services/api';

export default function ProjectDashboard() {
  const [searchParams] = useSearchParams();
  const encryptedProjectId = searchParams.get('projectId');
  const projectId = encryptedProjectId ? decryptId(encryptedProjectId) : null;
  
  const { userType, universityId: userUniversityId } = useAuth();
  const { setBreadcrumb } = useBreadcrumb();
  const activeUniversityId = userUniversityId;

  const [project, setProject] = useState(null);
  const [papers, setPapers] = useState([]);
  const [stats, setStats] = useState({
    papersCount: 0,
    totalScripts: 0,
    pendingScripts: 0,
    allocatedScripts: 0,
    completedScripts: 0,
    completePercentage: 0
  });
  const [examiners, setExaminers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setBreadcrumb([
      { label: 'Coordinator Dashboard', path: '/coordinator/dashboard', icon: 'LayoutDashboard' },
      { label: 'Project Stats Dashboard', path: `/project-dashboard?projectId=${encryptedProjectId}`, icon: 'Layers' }
    ]);
  }, [encryptedProjectId]);

  useEffect(() => {
    if (projectId) {
      fetchProjectStats();
    } else {
      setError("No project ID specified.");
      setLoading(false);
    }
  }, [projectId]);

  const fetchProjectStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get Current Coordinator's University & Projects
      const uniData = await apiCall('/universities/current/my-university');
      const foundProject = (uniData.projects || []).find(p => p.projectId.toString() === projectId.toString());
      
      if (!foundProject) {
        throw new Error("Project not found or you do not have permission to view it.");
      }
      setProject(foundProject);

      // 2. Fetch all papers mapped to this project
      const papersData = await apiCall(`/papers?projectId=${projectId}`);
      setPapers(papersData || []);

      // 3. Fetch all scripts
      const scripts = await apiCall('/scripts?limit=5000');
      const projPaperIds = (papersData || []).map(p => p.paperId);
      const projScripts = scripts.filter(s => projPaperIds.includes(s.paperId));

      const total = projScripts.length;
      const completed = projScripts.filter(s => s.status === 'completed').length;
      const allocated = projScripts.filter(s => s.status === 'allocated' || s.status === 'marking').length;
      const pending = projScripts.filter(s => s.status === 'pending' || (!s.allocatedUserId && s.status !== 'completed')).length;

      setStats({
        papersCount: papersData.length,
        totalScripts: total,
        pendingScripts: pending,
        allocatedScripts: allocated,
        completedScripts: completed,
        completePercentage: total > 0 ? Math.round((completed / total) * 100) : 0
      });

      // 4. Fetch Allocations to calculate examiner details
      let allocationsData = [];
      try {
        allocationsData = await apiCall('/allocation');
      } catch (err) {
        console.error("Failed to load allocations:", err);
      }

      // 5. Fetch Examiners and filter workload specifically for this project's scripts
      const usersData = await apiCall(`/users?universityId=${uniData.universityId}`);
      const examinersList = (usersData || []).filter(u => u.userType?.toLowerCase() === 'examiner');

      const examinersWithWorkload = examinersList.map(ex => {
        const examinerAllocations = allocationsData.filter(
          a => (a.examinerId === ex.id || a.allocatedUserId === ex.id)
        );
        
        // Find allocations specific to this project's papers
        const projAllocations = examinerAllocations.filter(a => projPaperIds.includes(a.paperId));

        let workload = 'Free';
        if (examinerAllocations.length > 20) workload = 'Fully Allocated';
        else if (examinerAllocations.length > 0) workload = 'Partially Allocated';

        return {
          ...ex,
          allocatedCount: examinerAllocations.length,
          projectAllocatedCount: projAllocations.length,
          workload
        };
      }).filter(ex => ex.projectAllocatedCount > 0 || ex.allocatedCount >= 0); // Include active or available examiners

      setExaminers(examinersWithWorkload);

    } catch (err) {
      console.error("Failed to load project dashboard stats:", err);
      setError(err.message || "Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-650 border-t-transparent"></div>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider animate-pulse">Aggregating Project Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full border border-red-150 text-center">
          <AlertCircle size={40} className="mx-auto text-red-500 mb-4 animate-bounce" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <Link 
            to="/coordinator/dashboard"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 w-full px-6 lg:px-10">
      
      {/* Header with Navigation */}
      <div className="pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <Link 
              to="/coordinator/dashboard" 
              className="p-2.5 hover:bg-slate-105 rounded-xl border border-slate-150 bg-slate-50 text-slate-600 transition"
              title="Return to Coordinator Dashboard"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[8px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  Evaluation Control Panel
                </span>
                <span className="bg-slate-100 text-slate-600 text-[8px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  ID: PRJ-{project?.projectId}
                </span>
              </div>
              <h1 className="text-lg font-black text-slate-900 mt-1 leading-tight">{project?.projectName}</h1>
              <p className="text-slate-500 text-xs mt-0.5">Comprehensive real-time scripts tracking & evaluation progress metrics</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link 
              to={userType === 'admin' 
                ? `/admin/papers?projectId=${encryptedProjectId}`
                : `/papers?projectId=${encryptedProjectId}`}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl border border-indigo-155 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <FileText size={13} />
              Configure Papers
            </Link>
            <Link 
              to={userType === 'admin'
                ? `/admin/allocate-scripts?projectId=${encryptedProjectId}`
                : `/allocate-scripts?projectId=${encryptedProjectId}`}
              className="bg-indigo-655 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100"
            >
              <Zap size={13} />
              Allocate Scripts
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        
        {/* Total Papers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-650">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Mapped Papers</span>
            <div className="p-2 bg-indigo-50 rounded-lg"><FileText size={14} /></div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-950">{stats.papersCount}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Configured subject question papers</p>
          </div>
        </div>

        {/* Total Scripts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Scripts</span>
            <div className="p-2 bg-slate-50 rounded-lg"><BookOpen size={14} /></div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-950">{stats.totalScripts}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Total answer sheets uploaded</p>
          </div>
        </div>

        {/* Pending Allocation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pending Assign</span>
            <div className="p-2 bg-amber-50 rounded-lg"><AlertCircle size={14} /></div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-amber-650">{stats.pendingScripts}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Awaiting examiner mapping</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">In Marking</span>
            <div className="p-2 bg-blue-50 rounded-lg"><Clock size={14} /></div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-blue-650">{stats.allocatedScripts}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Currently being evaluated</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Fully Mapped</span>
            <div className="p-2 bg-emerald-50 rounded-lg"><CheckCircle size={14} /></div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-emerald-650">{stats.completedScripts}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Evaluations 100% complete</p>
          </div>
        </div>

      </div>

      {/* Progress Ratio Bar Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Project Completion Status</h3>
            <p className="text-[10px] text-slate-500">Overall ratio of completed script evaluations against total system scripts</p>
          </div>
          <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg">
            {stats.completePercentage}% Complete
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 border border-slate-200 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${stats.completePercentage}%` }}
          />
        </div>
      </div>

      {/* Analytics Tabs and Mappings */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT - Papers & Mapped Details */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <FileText size={15} className="text-indigo-600" />
                  <span>Mapped Subject Papers</span>
                </h3>
                <p className="text-[10px] text-slate-500">Subject configurations, paper code, max marks, and map progress</p>
              </div>
            </div>

            {papers.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <FileText size={36} className="mx-auto text-slate-200 mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider">No Papers Mapped</p>
                <p className="text-[10px] mt-0.5">Please add and configure papers for this project.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Code & Name</th>
                      <th className="px-5 py-3.5">Catch Number</th>
                      <th className="px-5 py-3.5 text-center">Marks</th>
                      <th className="px-5 py-3.5 text-center">Questions</th>
                      <th className="px-5 py-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                    {papers.map((paper) => (
                      <tr key={paper.paperId} className="hover:bg-slate-50/50 transition">
                        <td className="px-5 py-4">
                          <span className="text-slate-900 font-extrabold">{paper.paperCode}</span>
                          <span className="text-[10px] text-slate-500 block font-medium mt-0.5">{paper.paperName}</span>
                        </td>
                        <td className="px-5 py-4 text-slate-550 font-mono text-[11px]">{paper.catchNo || 'N/A'}</td>
                        <td className="px-5 py-4 text-center text-slate-900">{paper.maxMarks}</td>
                        <td className="px-5 py-4 text-center text-slate-500">{paper.totalQuestions}</td>
                        <td className="px-5 py-4 text-right">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[8px] uppercase tracking-wider ${
                            paper.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'
                          }`}>
                            {paper.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COMPONENT - Assigned Examiners */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <Users size={15} className="text-indigo-650" />
                <span>Assigned Examiners Stats</span>
              </h3>
              <p className="text-[10px] text-slate-500">Active evaluators allocated to scripts within this project</p>
            </div>

            {examiners.length === 0 ? (
              <div className="p-12 text-center text-slate-400 border border-dashed border-slate-150 rounded-xl">
                <Users size={28} className="mx-auto text-slate-200 mb-1.5" />
                <p className="text-[9px] font-bold uppercase tracking-wider">No Evaluators Mapping</p>
              </div>
            ) : (
              <div className="space-y-3">
                {examiners.map((ex) => (
                  <div key={ex.id} className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 tracking-tight text-xs block">{ex.name}</span>
                      <span className="text-[9px] text-slate-400 font-bold block">{ex.email}</span>
                    </div>

                    <div className="text-right">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider mb-1 ${
                        ex.workload === 'Free' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {ex.workload}
                      </span>
                      <span className="text-[9px] text-slate-400 block font-bold">
                        Mapped: <span className="text-slate-900 font-extrabold">{ex.projectAllocatedCount}</span> scripts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
