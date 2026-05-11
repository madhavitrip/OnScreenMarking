import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  School, 
  Building2, 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  FileText, 
  FileCheck, 
  Users, 
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  ShieldCheck,
  Activity
} from 'lucide-react';
import apiCall from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    universities: 0,
    departments: 0,
    users: 0,
    projects: 0,
    activePapers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // In a real app, these would be separate calls or one summary call
      const uniData = await apiCall('/universities');
      const userData = await apiCall('/users');
      const projectData = await apiCall('/project');
      
      setStats({
        universities: uniData.length,
        departments: 0, // Placeholder
        users: userData.length,
        projects: projectData.length,
        activePapers: 0 // Placeholder
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const adminMenuItems = [
    {
      id: 'universities',
      title: 'Universities',
      description: 'Manage all participating universities',
      icon: <School size={24} />,
      path: '/admin/universities',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50'
    },
    {
      id: 'departments',
      title: 'Departments',
      description: 'Configure academic departments',
      icon: <Building2 size={24} />,
      path: '/admin/departments',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50'
    },
    {
      id: 'subjects',
      title: 'Subjects',
      description: 'Define course subjects and criteria',
      icon: <BookOpen size={24} />,
      path: '/admin/subjects',
      color: 'bg-green-500',
      lightColor: 'bg-green-50'
    },
    {
      id: 'sessions',
      title: 'Sessions',
      description: 'Manage examination sessions',
      icon: <Calendar size={24} />,
      path: '/admin/sessions',
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50'
    },
    {
      id: 'projects',
      title: 'Projects',
      description: 'Organize marking projects',
      icon: <ClipboardList size={24} />,
      path: '/admin/projects',
      color: 'bg-red-500',
      lightColor: 'bg-red-50'
    },
    {
      id: 'papers',
      title: 'Papers',
      description: 'Configure exam papers and sections',
      icon: <FileText size={24} />,
      path: '/admin/papers',
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50'
    },
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

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold mb-1">
              <LayoutDashboard size={20} />
              <span className="uppercase tracking-wider text-xs">Administrative Portal</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm">Welcome back. Here is what is happening across the system today.</p>
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
            title="Total Universities" 
            value={stats.universities} 
            icon={<School className="text-blue-600" />} 
            trend="+2 this month"
            bgColor="bg-blue-50"
          />
          <StatCard 
            title="Active Users" 
            value={stats.users} 
            icon={<Users className="text-purple-600" />} 
            trend="+12% growth"
            bgColor="bg-purple-50"
          />
          <StatCard 
            title="Live Projects" 
            value={stats.projects} 
            icon={<ClipboardList className="text-green-600" />} 
            trend="4 ending soon"
            bgColor="bg-green-50"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminMenuItems.map((item) => (
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

        {/* Recent Activity / Secondary Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent System Logs</h3>
              <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              <ActivityLog 
                user="Admin" 
                action="Updated university criteria" 
                time="2 mins ago" 
                icon={<School size={14} />}
                color="text-blue-600"
              />
              <ActivityLog 
                user="System" 
                action="New examiner registered" 
                time="15 mins ago" 
                icon={<Users size={14} />}
                color="text-green-600"
              />
              <ActivityLog 
                user="Coordinator" 
                action="Paper CS-101 marks approved" 
                time="1 hour ago" 
                icon={<FileCheck size={14} />}
                color="text-purple-600"
              />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">System Analytics</h3>
              <p className="text-blue-100 text-sm opacity-80">Track real-time evaluation progress across all active projects.</p>
            </div>
            <div className="mt-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-bold">84%</span>
                <span className="text-xs text-blue-200">Overall Progress</span>
              </div>
              <div className="w-full bg-blue-900/30 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
            <button className="mt-8 w-full bg-white text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
              Generate Report
            </button>
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
        <span className="text-green-500 text-xs font-bold flex items-center">
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

function ActivityLog({ user, action, time, icon, color }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            <span className="text-blue-600">{user}</span> {action}
          </p>
          <p className="text-xs text-gray-400">{time}</p>
        </div>
      </div>
      <ChevronRight size={14} className="text-gray-300" />
    </div>
  );
}
