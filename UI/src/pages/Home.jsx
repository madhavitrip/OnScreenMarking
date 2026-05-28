import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ChevronRight,
  Search,
  Sparkles,
  Camera,
  Activity,
  Calendar,
  X,
  UserCheck,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [webcamStep, setWebcamStep] = useState(1); // 1: Info, 2: Camera Feed, 3: Completed
  const [webcamStatus, setWebcamStatus] = useState("Calibrated");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { text: "Good Morning", icon: "🌅" };
    if (hour < 17) return { text: "Good Afternoon", icon: "☀️" };
    return { text: "Good Evening", icon: "🌙" };
  };

  const handleStartMarking = (script) => {
    const queryParams = new URLSearchParams({
      scriptId: script.id,
      paperId: script.paperId || '',
      barCode: script.generatedBarcode || '',
      allocationId: script.allocationId || '',
      examinerId: user?.id || '',
      cleanPdfUrl: script.answerSheetPdfUrl || ''
    }).toString();

    navigate(`/marking?${queryParams}`, {
      state: {
        scriptId: script.id,
        paperId: script.paperId,
        barCode: script.generatedBarcode,
        allocationId: script.allocationId,
        cleanPdfUrl: script.answerSheetPdfUrl
      }
    });
  };

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

        // Set recent scripts (limit to 10 for interactive filtering)
        const sortedScripts = [...scripts]
          .sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt));
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

  const startCalibration = () => {
    setWebcamStep(1);
    setShowWebcamModal(true);
  };

  const handleNextStep = () => {
    if (webcamStep === 1) {
      setWebcamStep(2);
      // Simulate calibration transition after 3s
      setTimeout(() => {
        setWebcamStep(3);
        setWebcamStatus("Calibrated");
      }, 3500);
    } else {
      setShowWebcamModal(false);
    }
  };

  // Filter scripts based on search query and status filter
  const filteredScripts = recentScripts.filter(script => {
    const matchesSearch = 
      (script.generatedBarcode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (script.paper?.paperName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      `SCR-${script.id}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'completed') return matchesSearch && script.status === 'completed';
    if (statusFilter === 'marking') return matchesSearch && script.status === 'marking';
    if (statusFilter === 'pending') return matchesSearch && (script.status === 'allocated' || script.status === 'pending');
    return matchesSearch;
  });

  const greeting = getGreeting();

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <Activity size={20} className="absolute text-blue-600 animate-pulse" />
        </div>
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Configuring Your Cockpit...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 transition-all duration-300">
      
      {/* Dynamic Greetings & Info Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-850 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        {/* Abstract shapes for premium graphics */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wide">
              <Sparkles size={13} className="text-amber-300 animate-pulse" />
              <span>{greeting.icon} {greeting.text}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome Back, <span className="text-amber-300 font-black">{user?.name || "Examiner"}</span>
            </h1>
            <p className="text-blue-100 text-xs max-w-xl leading-relaxed">
              Your active session is fully authenticated. Let's make marking swift, accurate, and fair today! Your calculated calibration status is 
              <span className="ml-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px] uppercase">
                {webcamStatus}
              </span>.
            </p>
          </div>

          <div className="flex flex-row sm:flex-row items-center gap-4 bg-white/10 backdrop-blur-lg border border-white/10 p-4 rounded-2xl self-start lg:self-center shrink-0">
            <div className="p-2 bg-white/10 rounded-xl text-center shrink-0">
              <Calendar size={18} className="mx-auto text-amber-300 mb-0.5" />
              <span className="block text-[8px] font-black uppercase text-blue-200">Date</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-black tracking-wide text-blue-100">{formattedDate}</p>
              <p className="text-lg font-black tracking-tight text-white font-mono">{formattedTime}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} className="bg-red-100 p-1 rounded-full shrink-0" />
          <span className="text-xs font-bold">{error}</span>
        </div>
      )}

      {/* Main Grid: Statistics & Live webcam quick-check widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Stats (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Total Assigned"
              value={stats.totalScripts}
              icon={<FileText className="text-blue-600" />}
              bgColor="bg-blue-50"
              borderClass="border-l-4 border-blue-600 shadow-blue-50"
              subtitle="allocated sheets"
            />
            <StatCard
              title="Completed"
              value={stats.evaluated}
              icon={<CheckCircle className="text-emerald-600" />}
              bgColor="bg-emerald-50"
              borderClass="border-l-4 border-emerald-600 shadow-emerald-50"
              subtitle="successfully marked"
            />
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              icon={<Clock className="text-amber-600" />}
              bgColor="bg-amber-50"
              borderClass="border-l-4 border-amber-500 shadow-amber-50"
              subtitle="currently editing"
            />
            <StatCard
              title="Average Marks"
              value={`${stats.averageScore}`}
              icon={<TrendingUp className="text-indigo-600" />}
              bgColor="bg-indigo-50"
              borderClass="border-l-4 border-indigo-600 shadow-indigo-50"
              subtitle="across evaluated papers"
            />
          </div>

          {/* Progress Visualizer */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <Award size={14} className="text-blue-600 animate-bounce" />
                  Marking Progress Velocity
                </h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Real-time percentage overview of your workload</p>
              </div>
              <span className="text-[11px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                {stats.totalScripts > 0 ? Math.round((stats.evaluated / stats.totalScripts) * 100) : 0}% Done
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden border border-gray-100 flex p-0.5">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${stats.totalScripts > 0 ? (stats.evaluated / stats.totalScripts) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>0% Start</span>
                <span>{stats.evaluated} of {stats.totalScripts} Evaluated</span>
                <span>100% Target</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Identity Verification / Webcam Health (Span 1) */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <Camera size={14} className="text-violet-600" />
                Examiner Verification
              </h2>
              <span className={`h-2 w-2 rounded-full ${webcamStatus === 'Calibrated' ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`}></span>
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              To comply with grading integrity guidelines, periodic identity checks monitor your presence. Ensure your camera is properly aligned.
            </p>
          </div>

          {/* Interactive Status Widget */}
          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center text-slate-700">
              <UserCheck size={20} className={webcamStatus === 'Calibrated' ? "text-emerald-500 animate-pulse" : "text-gray-400"} />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-gray-900">AI Identity Feed Status</p>
              <p className={`text-[10px] font-black uppercase tracking-wide mt-0.5 ${webcamStatus === 'Calibrated' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {webcamStatus === 'Calibrated' ? 'Verified & Secure' : 'Needs Calibration'}
              </p>
            </div>
            <button
              onClick={startCalibration}
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer shadow-md hover:scale-[1.02]"
            >
              Calibrate Webcam Now
            </button>
          </div>

          <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold border-t border-gray-100 pt-3">
            <span className="flex items-center gap-1"><Activity size={10} className="text-emerald-500" /> Ping: Stable</span>
            <span className="flex items-center gap-1"><Zap size={10} className="text-amber-500" /> Auto-Save: Enabled</span>
          </div>
        </div>

      </div>

      {/* Quick Action Panel without redundant list links */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-wider text-gray-800 mb-3 tracking-widest">Performance & Report Panels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/reports"
            className="group bg-white rounded-2xl p-4 border border-gray-150/70 hover:shadow-md hover:border-blue-400 hover:bg-blue-50/10 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-green-50 text-green-600 w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner shrink-0">
                <BarChart3 size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Evaluation Analytics</h3>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Review grade distributions and marking times</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
          </Link>

          <Link
            to="/settings"
            className="group bg-white rounded-2xl p-4 border border-gray-150/70 hover:shadow-md hover:border-blue-400 hover:bg-blue-50/10 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-purple-50 text-purple-600 w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner shrink-0">
                <Settings size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">OSM Preferences</h3>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Manage themes, speed profiles and notification alerts</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
          </Link>
        </div>
      </div>

      {/* Interactive Script Control Cockpit */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-800">Allocated Scripts Registry</h2>
              <p className="text-[10px] text-gray-500 mt-0.5">Filter, search, and jump directly into evaluating your papers</p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button 
                onClick={fetchExaminerData}
                title="Refresh Registry"
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-slate-50 border border-gray-200 rounded-xl transition-all cursor-pointer shrink-0"
              >
                <RefreshCw size={14} />
              </button>
              <Link to="/scripts" className="text-[10px] font-black text-blue-650 bg-blue-50 border border-blue-100 hover:bg-blue-100/70 px-3.5 py-2 rounded-xl transition-all shrink-0">
                Open Script Manager
              </Link>
            </div>
          </div>

          {/* Interactive Filter and Search Bar */}
          <div className="flex flex-col md:flex-row gap-3 pt-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search by Barcode or Subject name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-550 focus:border-transparent bg-slate-50/50 hover:bg-white transition-all text-gray-800 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-450 hover:text-gray-700"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Status Tabs */}
            <div className="flex bg-slate-100/80 p-1 rounded-xl self-start border border-slate-200/50 shrink-0">
              {[
                { key: 'all', label: 'All Statuses' },
                { key: 'pending', label: 'Pending' },
                { key: 'marking', label: 'In Progress' },
                { key: 'completed', label: 'Completed' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    statusFilter === tab.key
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-200/40'
                      : 'text-gray-555 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {filteredScripts.length === 0 ? (
          <div className="py-12 text-center text-gray-450 space-y-2">
            <FileText size={38} className="mx-auto text-gray-300 opacity-80" />
            <p className="text-xs font-bold uppercase tracking-wider">No matching scripts found</p>
            <p className="text-[10px] text-gray-400">Try adjusting your search query or status filter above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/70 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Barcode / Script ID</th>
                  <th className="px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Subject & Paper</th>
                  <th className="px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Marks Obtained</th>
                  <th className="px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Last Activity</th>
                  <th className="px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Interactive Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/70">
                {filteredScripts.map((script) => (
                  <tr key={script.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-3 font-bold text-xs text-gray-950">
                      {script.generatedBarcode || `SCR-${script.id}`}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-700 font-semibold">
                      {script.paper?.paperName || `Paper ID: ${script.paperId}`}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          script.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : script.status === 'marking'
                            ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${
                          script.status === 'completed' ? 'bg-emerald-500' : script.status === 'marking' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></span>
                        {script.status === 'completed' ? 'Completed' : script.status === 'marking' ? 'In Progress' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-black text-xs text-gray-900">
                      {script.totalMarks !== null ? (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                          {script.totalMarks} marks
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Not evaluated</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[10px] text-gray-500 font-medium">
                      {new Date(script.submittedAt || script.createdAt).toLocaleDateString()} at {new Date(script.submittedAt || script.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {script.status === 'completed' ? (
                        <button
                          onClick={() => handleStartMarking(script)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer group-hover:scale-105"
                        >
                          <Eye size={10} />
                          Review Marks
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartMarking(script)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-extrabold text-[9px] uppercase tracking-wider transition-all shadow-md cursor-pointer animate-pulse hover:scale-105"
                        >
                          <Zap size={10} className="fill-white" />
                          Evaluate Script
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* High-Fidelity Webcam Identity Calibration Simulation Modal */}
      {showWebcamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Camera className="text-blue-600" size={18} />
                <h3 className="font-black text-sm uppercase text-gray-900 tracking-wider">Webcam Calibration</h3>
              </div>
              <button 
                onClick={() => setShowWebcamModal(false)}
                className="text-gray-400 hover:text-gray-700 hover:bg-slate-150 p-1.5 rounded-full transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              
              {/* Step 1: Info */}
              {webcamStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 text-blue-800">
                    <Sparkles size={24} className="shrink-0 text-amber-500 animate-pulse" />
                    <div className="text-xs">
                      <p className="font-extrabold mb-1">Interactive Calibration Protocol</p>
                      <p className="leading-relaxed text-blue-750">
                        Our AI system will calibrate against your ambient room lighting, screen glare, and face posture to ensure maximum verification stability during your marking session.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pre-check requirements</p>
                    <ul className="text-xs text-gray-650 space-y-1.5 list-disc pl-4 font-medium">
                      <li>Center your face within the camera boundaries</li>
                      <li>Avoid extreme backlighting or very dark environments</li>
                      <li>Keep your webcam lens clean</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 2: Camera Feed Simulation */}
              {webcamStep === 2 && (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-gray-950 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-inner flex items-center justify-center">
                    {/* Simulated Camera Overlay */}
                    <div className="absolute inset-0 border-[3px] border-blue-400/20 m-4 rounded-xl flex items-center justify-center">
                      {/* Scanning active line */}
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-[bounce_3s_infinite] shadow-lg"></div>
                      
                      {/* Grid markers */}
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-400"></div>
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-400"></div>
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-400"></div>
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-400"></div>

                      <div className="text-center text-white/95 space-y-2 z-10 px-4">
                        <Activity size={24} className="mx-auto text-blue-400 animate-spin" />
                        <p className="text-xs font-black uppercase tracking-widest animate-pulse">Scanning Face Metrics...</p>
                        <p className="text-[9px] text-gray-400">Locking facial anchors. Ambient lighting is normal.</p>
                      </div>
                    </div>
                    {/* Subtle silhouette silhouette in background */}
                    <div className="w-24 h-24 rounded-full border border-white/10 bg-white/5 opacity-10 flex items-center justify-center">
                      <UserCheck size={40} className="text-white" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-100 p-3 rounded-xl text-[10px] font-bold">
                    <AlertTriangle size={14} className="shrink-0 text-amber-500" />
                    <span>Please sit still. Calibrating face angles and screen alignment...</span>
                  </div>
                </div>
              )}

              {/* Step 3: Completed */}
              {webcamStep === 3 && (
                <div className="text-center space-y-4 py-3">
                  <div className="mx-auto w-14 h-14 bg-emerald-50 border border-emerald-250 rounded-full flex items-center justify-center text-emerald-600 shadow-md">
                    <CheckCircle2 size={32} className="animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">Calibration Successful!</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      Your identity verification is securely configured. Periodic posture alignment checks are active in the background.
                    </p>
                  </div>
                  <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100 text-[10px] text-emerald-800 font-extrabold flex justify-around">
                    <span>Posture: Excellent</span>
                    <span>Lighting: 94%</span>
                    <span>Status: ACTIVE</span>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              {webcamStep === 2 ? (
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-650 h-full animate-[loading_3.5s_ease-in-out]"></div>
                </div>
              ) : (
                <button
                  onClick={handleNextStep}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wide cursor-pointer transition-all shadow-md"
                >
                  {webcamStep === 1 ? 'Start Scanning' : 'Done & Return'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ title, value, icon, bgColor, borderClass, subtitle }) => {
  return (
    <div className={`bg-white rounded-3xl p-4.5 shadow-sm border border-gray-100 ${borderClass} hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between group`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[9px] uppercase font-black text-gray-400 tracking-wider">{title}</span>
        <div className={`p-2 ${bgColor} rounded-xl group-hover:scale-110 transition-transform`}>
          {icon ? <span className="[&>svg]:w-4 [&>svg]:h-4">{icon}</span> : null}
        </div>
      </div>
      <div>
        <p className="text-xl font-black text-gray-950 tracking-tight">{value}</p>
        {subtitle && <p className="text-[9px] text-gray-450 font-bold mt-0.5 leading-tight">{subtitle}</p>}
      </div>
    </div>
  );
};

export default Home;
