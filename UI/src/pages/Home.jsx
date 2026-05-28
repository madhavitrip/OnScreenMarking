import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  BarChart3, 
  Zap, 
  TrendingUp, 
  Settings, 
  Award,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiCall from '../services/api';

const Home = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalScripts: 0,
    evaluated: 0,
    pending: 0,
    inProgress: 0,
    averageScore: 0,
  });
  const [recentScripts, setRecentScripts] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetchExaminerData();
    }
  }, [user]);

  const fetchExaminerData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const scripts = await apiCall(`/scripts/examiner/${user.id}`);
      
      if (scripts && scripts.length > 0) {
        const total = scripts.length;
        const evaluatedCount = scripts.filter(s => s.status === 'completed').length;
        const markingCount = scripts.filter(s => s.status === 'marking').length;
        const pendingCount = scripts.filter(s => s.status === 'allocated' || s.status === 'pending').length;
        
        // Calculate average score for completed scripts
        const completedScripts = scripts.filter(s => s.status === 'completed' && s.totalMarks !== null);
        const sumMarks = completedScripts.reduce((sum, s) => sum + parseFloat(s.totalMarks), 0);
        const avgScore = completedScripts.length > 0 ? (sumMarks / completedScripts.length) : 0;

        setStats({
          totalScripts: total,
          evaluated: evaluatedCount,
          inProgress: markingCount,
          pending: pendingCount,
          averageScore: parseFloat(avgScore.toFixed(1)),
        });

        // Set recent scripts (limit to 5)
        const sortedScripts = [...scripts]
          .sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt))
          .slice(0, 5);
        setRecentScripts(sortedScripts);
      } else {
        setStats({
          totalScripts: 0,
          evaluated: 0,
          pending: 0,
          inProgress: 0,
          averageScore: 0,
        });
        setRecentScripts([]);
      }
    } catch (err) {
      console.error("Failed to load examiner stats:", err);
      setError("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const quickAccessModules = [
    {
      id: 'scripts',
      title: 'My Allocated Scripts',
      description: 'Start or continue answer sheet evaluation',
      icon: <Zap size={24} />,
      path: '/scripts',
      color: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
      textColor: 'text-blue-600',
      lightColor: 'bg-blue-50/50'
    },
    {
      id: 'reports',
      title: 'Evaluation Reports',
      description: 'View grading analysis and statistics',
      icon: <BarChart3 size={24} />,
      path: '/reports',
      color: 'bg-green-600 hover:bg-green-700 shadow-green-100',
      textColor: 'text-green-600',
      lightColor: 'bg-green-50/50'
    },
    {
      id: 'settings',
      title: 'Account Settings',
      description: 'Update profile and camera preferences',
      icon: <Settings size={24} />,
      path: '/settings',
      color: 'bg-purple-600 hover:bg-purple-700 shadow-purple-100',
      textColor: 'text-purple-600',
      lightColor: 'bg-purple-50/50'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-wide text-xs">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold mb-1">
            <span className="uppercase tracking-widest text-[9px] font-extrabold">University Exams</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Evaluation Dashboard</h1>
          <p className="text-gray-500 text-xs mt-0.5">Logged in as Examiner: <span className="font-bold text-gray-800">{user?.name}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchExaminerData}
            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="bg-red-100 p-1 rounded-full shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assigned"
          value={stats.totalScripts}
          icon={<FileText className="text-blue-600" />}
          bgColor="bg-blue-50"
          borderClass="border-l-4 border-blue-600"
        />
        <StatCard
          title="Completed"
          value={stats.evaluated}
          icon={<CheckCircle className="text-green-600" />}
          bgColor="bg-green-50"
          borderClass="border-l-4 border-green-600"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={<Clock className="text-yellow-600" />}
          bgColor="bg-yellow-50"
          borderClass="border-l-4 border-yellow-500"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          icon={<AlertCircle className="text-red-600" />}
          bgColor="bg-red-50"
          borderClass="border-l-4 border-red-500"
        />
      </div>

      {/* Evaluation Progress Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-1.5">
          <Award size={14} className="text-blue-600" />
          Overall Evaluation Progress
        </h2>
        <div>
          <div className="flex justify-between mb-1.5">
            <span className="text-[11px] font-bold text-gray-600">Completion Ratio</span>
            <span className="text-[11px] font-bold text-blue-600">
              {stats.totalScripts > 0 ? Math.round((stats.evaluated / stats.totalScripts) * 100) : 0}% Evaluated
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.totalScripts > 0 ? (stats.evaluated / stats.totalScripts) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Access Modules */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">Quick Access Panel</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickAccessModules.map((module) => (
            <Link
              key={module.id}
              to={module.path}
              className="group bg-white rounded-xl p-3.5 border border-gray-100 hover:shadow-md hover:border-blue-350 hover:bg-blue-50/10 transition-all duration-350 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`${module.lightColor} ${module.textColor} w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner shrink-0 [&>svg]:w-4.5 [&>svg]:h-4.5`}>
                  {module.icon}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{module.title}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{module.description}</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Allocated Scripts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">Recent Assignments</h2>
            <p className="text-[11px] text-gray-500">Latest answer sheet allocations assigned for evaluation</p>
          </div>
          <Link to="/scripts" className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1">
            View All Scripts <ChevronRight size={12} />
          </Link>
        </div>
        
        {recentScripts.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <FileText size={40} className="mx-auto mb-2 opacity-20" />
            <p className="text-xs font-medium uppercase">No scripts allocated to you yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Barcode / Script ID</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subject & Paper</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Marks Obtained</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentScripts.map((script) => (
                  <tr key={script.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-xs text-gray-950">
                      {script.generatedBarcode || `SCR-${script.id}`}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">
                      {script.paper?.paperName || `Paper ID: ${script.paperId}`}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide ${
                          script.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : script.status === 'marking'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}
                      >
                        {script.status === 'completed' ? 'Completed' : script.status === 'marking' ? 'In Progress' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-bold text-xs text-gray-900">
                      {script.totalMarks !== null ? `${script.totalMarks} marks` : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-[10px] text-gray-500">
                      {new Date(script.submittedAt || script.createdAt).toLocaleDateString()} at {new Date(script.submittedAt || script.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bgColor, borderClass, subtitle }) => {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${borderClass} hover:translate-y-[-2px] transition-all flex flex-col justify-between`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">{title}</span>
        <div className={`p-1.5 ${bgColor} rounded-lg`}>
          {icon ? <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span> : null}
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <p className="text-base font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <span className="text-[10px] text-gray-500 font-semibold">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};

export default Home;
