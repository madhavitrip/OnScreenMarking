import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Building2, 
  BookOpen, 
  Calendar, 
  FileText, 
  Users, 
  School,
  Sparkles,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiCall from '../services/api';

export default function UniversityConfigHeader() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { userType, universityId: userUniversityId } = useAuth();
  
  const universityId = userType === 'coordinator' ? userUniversityId : searchParams.get('universityId');
  const [universityName, setUniversityName] = useState('University Management');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (universityId) {
      fetchUniversityDetails();
    }
  }, [universityId]);

  const fetchUniversityDetails = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`/universities/${universityId}`);
      if (data && data.universityName) {
        setUniversityName(data.universityName);
      }
    } catch (err) {
      // Fallback: fetch list and match
      try {
        const unis = await apiCall('/universities');
        const match = unis.find(u => u.universityId === parseInt(universityId, 10));
        if (match) {
          setUniversityName(match.universityName);
        }
      } catch (innerErr) {
        console.error('Failed to resolve university details:', innerErr);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!universityId) return null;

  // Tabs layout
  const baseTabs = [
    {
      id: 'departments',
      label: 'Departments',
      icon: <Building2 size={16} />,
      path: userType === 'admin' ? '/admin/departments' : '/departments'
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: <GraduationCap size={16} />,
      path: userType === 'admin' ? '/admin/courses' : '/courses'
    },
    {
      id: 'subjects',
      label: 'Subjects',
      icon: <BookOpen size={16} />,
      path: userType === 'admin' ? '/admin/subjects' : '/subjects'
    },
    {
      id: 'sessions',
      label: 'Sessions & Projects',
      icon: <Calendar size={16} />,
      path: userType === 'admin' ? '/admin/sessions' : '/sessions'
    },
  ];

  // Add Users tab for admin
  const tabs = userType === 'admin' 
    ? [
        ...baseTabs,
        {
          id: 'users',
          label: 'Personnel & Users',
          icon: <Users size={16} />,
          path: '/admin/users'
        }
      ]
    : baseTabs;

  const isCurrentTab = (tabPath) => {
    return location.pathname === tabPath;
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-150/70 shadow-sm space-y-5 mb-6">
      
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-100 shrink-0">
            <School size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-blue-600 font-extrabold text-[9px] uppercase tracking-widest leading-none mb-1">
              <Sparkles size={11} className="text-amber-400" />
              <span>Affiliated Operations Center</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none flex items-center gap-1">
              {universityName}
              {loading && <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>}
            </h2>
            <p className="text-[10px] text-gray-400 uppercase font-bold mt-1 tracking-wider">
              Identifier: UNIV-{universityId} • Scope: Full Academic Configuration
            </p>
          </div>
        </div>

        {userType === 'admin' && (
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-650 border border-slate-200 rounded-xl font-bold text-[9px] uppercase tracking-wider transition-all self-start md:self-center cursor-pointer shadow-sm shrink-0"
          >
            Back to Dashboard
            <ChevronRight size={11} />
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap bg-slate-50 p-1.5 rounded-2xl border border-slate-100 gap-1 select-none">
        {tabs.map((tab) => {
          const isActive = isCurrentTab(tab.path);
          const targetUrl = `${tab.path}?universityId=${universityId}`;
          
          return (
            <Link
              key={tab.id}
              to={targetUrl}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-650 text-white shadow-md hover:shadow-lg'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
