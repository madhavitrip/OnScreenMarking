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
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiCall from '../services/api';

export default function CoordinatorDashboard() {
  const { universityId } = useAuth();
  const [university, setUniversity] = useState(null);
  const [stats, setStats] = useState({
    departments: 0,
    subjects: 0,
    projects: 0,
    activePapers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUniversityData();
  }, []);

  const fetchUniversityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get coordinator's university
      const uniData = await apiCall('/universities/current/my-university');
      setUniversity(uniData);
      
      // Fetch stats for this university
      const deptData = await apiCall(`/departments?universityId=${uniData.universityId}`);
      
      setStats({
        departments: deptData.length,
        subjects: deptData.reduce((sum, dept) => sum + (dept.subjects?.length || 0), 0),
        projects: uniData.projects?.length || 0,
        activePapers: 0
      });
    } catch (err) {
      console.error('Failed to fetch university data:', err);
      setError(err.message || 'Failed to load university data');
    } finally {
      setLoading(false);
    }
  };

  const coordinatorMenuItems = [
    {
      id: 'departments',
      title: 'Departments',
      description: 'Manage academic departments',
      icon: <Building2 size={24} />,
      path: '/departments',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50'
    },
    {
      id: 'subjects',
      title: 'Subjects',
      description: 'Define course subjects and criteria',
      icon: <BookOpen size={24} />,
      path: '/subjects',
      color: 'bg-green-500',
      lightColor: 'bg-green-50'
    },
    {
      id: 'sessions',
      title: 'Sessions',
      description: 'Manage examination sessions',
      icon: <Calendar size={24} />,
      path: '/sessions',
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50'
    },
    {
      id: 'projects',
      title: 'Projects',
      description: 'Organize marking projects',
      icon: <ClipboardList size={24} />,
      path: '/projects',
      color: 'bg-red-500',
      lightColor: 'bg-red-50'
    },
    {
      id: 'papers',
      title: 'Papers',
      description: 'Configure exam papers and sections',
      icon: <FileText size={24} />,
      path: '/papers',
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50'
    },
    {
      id: 'allocate',
      title: 'Script Allocation',
      description: 'Allocate scripts to examiners by expertise',
      icon: <Zap size={24} />,
      path: '/allocate-scripts',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading university data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full">
          <div className="flex items-center gap-3 mb-4 text-red-600">
            <AlertCircle size={24} />
            <h2 className="text-lg font-bold">Error Loading Dashboard</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchUniversityData}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold mb-1">
              <LayoutDashboard size={20} />
              <span className="uppercase tracking-wider text-xs">University Portal</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {university?.universityName || 'University'} Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your university's examination and marking operations.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-full">
                <Activity size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">System Status</p>
                <p className="text-sm font-semibold text-gray-900">Operational</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Departments" 
            value={stats.departments} 
            icon={<Building2 className="text-purple-600" />} 
            trend="Active"
            bgColor="bg-purple-50"
          />
          <StatCard 
            title="Subjects" 
            value={stats.subjects} 
            icon={<BookOpen className="text-green-600" />} 
            trend="Configured"
            bgColor="bg-green-50"
          />
          <StatCard 
            title="Live Projects" 
            value={stats.projects} 
            icon={<ClipboardList className="text-red-600" />} 
            trend="In Progress"
            bgColor="bg-red-50"
          />
          <StatCard 
            title="System Performance" 
            value="99.9%" 
            icon={<TrendingUp className="text-orange-600" />} 
            trend="High stability"
            bgColor="bg-orange-50"
          />
        </div>

        {/* Module Grid */}
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          Management Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coordinatorMenuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 ${item.lightColor} opacity-50 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform`}></div>
              
              <div className="relative z-10">
                <div className={`${item.color} text-white w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:rotate-6 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-4">{item.description}</p>
                
                <div className="flex items-center text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
                  <span>Manage</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* University Info Section */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">University Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold mb-2">University Name</p>
              <p className="text-xl font-bold text-gray-900">{university?.universityName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold mb-2">Total Departments</p>
              <p className="text-xl font-bold text-gray-900">{stats.departments}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold mb-2">Active Status</p>
              <p className="text-xl font-bold text-green-600">
                {university?.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold mb-2">Total Subjects</p>
              <p className="text-xl font-bold text-gray-900">{stats.subjects}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, bgColor }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:translate-y-[-2px] transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 ${bgColor} rounded-xl`}>
          {icon}
        </div>
        <span className="text-blue-500 text-xs font-bold flex items-center">
          {trend}
        </span>
      </div>
      <div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
