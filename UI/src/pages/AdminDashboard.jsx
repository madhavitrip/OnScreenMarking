import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  School, 
  Building2, 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  FileText, 
  Users, 
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  ShieldCheck,
  Activity,
  Plus,
  Settings,
  AlertCircle
} from 'lucide-react';
import apiCall from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [stats, setStats] = useState({
    totalUniversities: 0,
    totalUsers: 0,
    totalProjects: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const uniData = await apiCall('/universities');
      setUniversities(uniData);
      
      setStats({
        totalUniversities: uniData.length,
        totalUsers: 0, // Will be fetched separately if needed
        totalProjects: 0 // Will be fetched separately if needed
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load universities');
    } finally {
      setLoading(false);
    }
  };

  const systemModules = [
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage admins, coordinators, and examiners',
      icon: <Users size={24} />,
      path: '/admin/users',
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50'
    },
    {
      id: 'config',
      title: 'System Config',
      description: 'Global system settings and security',
      icon: <ShieldCheck size={24} />,
      path: '/settings',
      color: 'bg-slate-600',
      lightColor: 'bg-slate-50'
    }
  ];

  const universityModules = [
    {
      id: 'departments',
      title: 'Departments',
      description: 'Configure academic departments',
      icon: <Building2 size={24} />,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50'
    },
    {
      id: 'subjects',
      title: 'Subjects',
      description: 'Define course subjects and criteria',
      icon: <BookOpen size={24} />,
      color: 'bg-green-500',
      lightColor: 'bg-green-50'
    },
    {
      id: 'sessions',
      title: 'Sessions',
      description: 'Manage examination sessions',
      icon: <Calendar size={24} />,
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50'
    },
    {
      id: 'projects',
      title: 'Projects',
      description: 'Organize marking projects',
      icon: <ClipboardList size={24} />,
      color: 'bg-red-500',
      lightColor: 'bg-red-50'
    },
    {
      id: 'papers',
      title: 'Papers',
      description: 'Configure exam papers and sections',
      icon: <FileText size={24} />,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Manage universities and system operations</p>
          </div>
          <Link
            to="/admin/universities"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Add University
          </Link>
        </div>

        {/* Quick Stats - Compact */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-gray-500 text-xs font-semibold mb-1">Universities</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUniversities}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-gray-500 text-xs font-semibold mb-1">Performance</p>
            <p className="text-2xl font-bold text-gray-900">99.9%</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-gray-500 text-xs font-semibold mb-1">Status</p>
            <p className="text-2xl font-bold text-green-600">Online</p>
          </div>
        </div>

        {/* System-wide Modules - Compact */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {systemModules.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="bg-white rounded-lg p-4 border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className={`${item.color} text-white p-2 rounded-lg`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{item.description}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        {/* Universities Section */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Universities</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">{error}</p>
                <button 
                  onClick={fetchData}
                  className="text-red-600 hover:text-red-700 text-xs font-semibold mt-1"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : universities.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <School className="mx-auto text-gray-400 mb-3" size={32} />
              <p className="text-gray-600 text-sm font-semibold mb-3">No universities yet</p>
              <Link
                to="/admin/universities"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <Plus size={16} />
                Create First University
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {universities.map((university) => (
                <UniversityCard
                  key={university.universityId}
                  university={university}
                  modules={universityModules}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UniversityCard({ university, modules }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all">
      {/* Header - Compact */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold truncate">{university.universityName}</h3>
            <p className="text-xs text-blue-100">{university.departments?.length || 0} depts • {university.projects?.length || 0} projects</p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${
            university.isActive 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {university.isActive ? 'Active' : 'Off'}
          </span>
        </div>
      </div>

      {/* Modules Grid - Compact */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {modules.map((module) => (
          <Link
            key={module.id}
            to={`/admin/${module.id}?universityId=${university.universityId}`}
            className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <div className={`${module.color} text-white p-1.5 rounded flex-shrink-0`}>
              {React.cloneElement(module.icon, { size: 14 })}
            </div>
            <p className="text-xs font-semibold text-gray-900 truncate">{module.title}</p>
          </Link>
        ))}
      </div>

      {/* Action Buttons - Compact */}
      <div className="flex gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50">
        <Link
          to={`/admin/users?universityId=${university.universityId}`}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 rounded transition-colors"
        >
          <Users size={14} />
          Users
        </Link>
        <Link
          to="/admin/universities"
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded transition-colors"
        >
          <Settings size={14} />
          Edit
        </Link>
      </div>
    </div>
  );
}
