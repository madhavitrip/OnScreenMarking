import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Zap, 
  FileText, 
  ChevronRight, 
  X, 
  Layers, 
  Activity, 
  LogOut,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { encryptId, decryptId } from '../utils/encryption';
import apiCall from '../services/api';

export default function ProjectCockpitSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userType } = useAuth();
  
  const [projectId, setProjectId] = useState(() => {
    return localStorage.getItem('selectedProjectId') || '';
  });
  
  const [projectInfo, setProjectInfo] = useState(null);
  const [stats, setStats] = useState({
    papersCount: 0,
    totalScripts: 0,
    pendingScripts: 0,
    allocatedScripts: 0,
    completedScripts: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for localStorage changes or navigation changes
    const activeProjId = localStorage.getItem('selectedProjectId') || '';
    setProjectId(activeProjId);
    if (activeProjId) {
      fetchProjectDetails(activeProjId);
    }
  }, [location.pathname]);

  const fetchProjectDetails = async (projId) => {
    try {
      setLoading(true);
      const uniData = await apiCall('/universities/current/my-university');
      const foundProject = (uniData.projects || []).find(p => p.projectId.toString() === projId.toString());
      if (foundProject) {
        setProjectInfo(foundProject);

        // Fetch stats
        const papersData = await apiCall(`/papers?projectId=${projId}`);
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
          completedScripts: completed
        });
      }
    } catch (err) {
      console.error("Failed to load sidebar project details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExitProject = () => {
    localStorage.removeItem('selectedProjectId');
    if (userType === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/coordinator/dashboard');
    }
  };

  if (!projectId || !projectInfo) return null;

  const currentPath = location.pathname;
  const isDashboardActive = currentPath.includes('project-dashboard');
  const isAllocationActive = currentPath.includes('allocate-scripts');
  const isPapersActive = currentPath.includes('papers');

  const encryptedProjId = encryptId(projectId);

  return (
    <aside className="w-80 bg-white border-l border-slate-150 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto shrink-0 flex flex-col justify-between p-5 shadow-sm select-none z-30">
      
      {/* Header and Stats */}
      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[8px] uppercase tracking-wider font-extrabold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded">
              Active Project Context
            </span>
            <button 
              onClick={handleExitProject}
              className="text-slate-400 hover:text-rose-600 p-1 hover:bg-slate-50 rounded-lg transition"
              title="Close & Exit Project Context"
            >
              <LogOut size={13} />
            </button>
          </div>
          <h3 className="text-xs font-black text-slate-900 mt-2 leading-tight">
            {projectInfo.projectName}
          </h3>
          <p className="text-[9px] text-slate-400 font-mono mt-0.5">ID: PRJ-{projectId}</p>
        </div>

        {/* Evaluation Stats Widget */}
        <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-2.5 text-[10px] font-bold text-slate-600">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 uppercase tracking-tight text-[9px]">Papers Mapped</span>
            <span className="text-slate-900 font-extrabold text-xs">{stats.papersCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 uppercase tracking-tight text-[9px]">Pending Allocation</span>
            <span className="text-amber-600 font-extrabold text-xs">{stats.pendingScripts}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 uppercase tracking-tight text-[9px]">Scripts in Marking</span>
            <span className="text-blue-600 font-extrabold text-xs">{stats.allocatedScripts}</span>
          </div>
          <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/60">
            <span className="text-slate-400 uppercase tracking-tight text-[9px]">Completed scripts</span>
            <span className="text-emerald-600 font-extrabold text-xs">{stats.completedScripts} / {stats.totalScripts}</span>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-2">
          <h4 className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Evaluation Workspace</h4>
          
          <Link
            to={userType === 'admin' 
              ? `/admin/project-dashboard?projectId=${encryptedProjId}`
              : `/project-dashboard?projectId=${encryptedProjId}`}
            className={`flex items-center justify-between p-3 rounded-xl border transition text-xs font-bold ${
              isDashboardActive 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-150'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${isDashboardActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                <Calendar size={13} />
              </div>
              <span>Project Dashboard</span>
            </div>
            <ChevronRight size={12} className={isDashboardActive ? 'text-white' : 'text-slate-400'} />
          </Link>

          <Link
            to={userType === 'admin'
              ? `/admin/allocate-scripts?projectId=${encryptedProjId}`
              : `/allocate-scripts?projectId=${encryptedProjId}`}
            className={`flex items-center justify-between p-3 rounded-xl border transition text-xs font-bold ${
              isAllocationActive 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-150'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${isAllocationActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                <Zap size={13} />
              </div>
              <span>Script Allocation</span>
            </div>
            <ChevronRight size={12} className={isAllocationActive ? 'text-white' : 'text-slate-400'} />
          </Link>

          <Link
            to={userType === 'admin' 
              ? `/admin/papers?projectId=${encryptedProjId}`
              : `/papers?projectId=${encryptedProjId}`}
            className={`flex items-center justify-between p-3 rounded-xl border transition text-xs font-bold ${
              isPapersActive 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-150'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${isPapersActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                <FileText size={13} />
              </div>
              <span>Add / Configure Paper</span>
            </div>
            <ChevronRight size={12} className={isPapersActive ? 'text-white' : 'text-slate-400'} />
          </Link>
        </div>
      </div>

      {/* Exit Button at bottom */}
      <button
        onClick={handleExitProject}
        className="w-full mt-8 py-2.5 hover:bg-rose-50 text-rose-600 hover:border-rose-200 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-slate-100/50"
      >
        <LogOut size={12} />
        Exit Project Context
      </button>

    </aside>
  );
}
