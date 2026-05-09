import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const adminMenuItems = [
    {
      id: 'universities',
      title: 'Universities',
      description: 'Manage universities',
      icon: '🏫',
      path: '/admin/universities',
      color: 'bg-blue-500'
    },
    {
      id: 'departments',
      title: 'Departments',
      description: 'Manage departments',
      icon: '🏢',
      path: '/admin/departments',
      color: 'bg-purple-500'
    },
    {
      id: 'subjects',
      title: 'Subjects',
      description: 'Manage subjects',
      icon: '📚',
      path: '/admin/subjects',
      color: 'bg-green-500'
    },
    {
      id: 'sessions',
      title: 'Sessions',
      description: 'Manage exam sessions',
      icon: '📅',
      path: '/admin/sessions',
      color: 'bg-yellow-500'
    },
    {
      id: 'projects',
      title: 'Projects',
      description: 'Manage projects',
      icon: '📋',
      path: '/admin/projects',
      color: 'bg-red-500'
    },
    {
      id: 'papers',
      title: 'Papers',
      description: 'Manage papers',
      icon: '📄',
      path: '/admin/papers',
      color: 'bg-indigo-500'
    },
    {
      id: 'scripts',
      title: 'Scripts',
      description: 'Manage scripts',
      icon: '📑',
      path: '/admin/scripts',
      color: 'bg-pink-500'
    },
    {
      id: 'allocations',
      title: 'Allocations',
      description: 'Allocate scripts to examiners',
      icon: '👥',
      path: '/admin/allocations',
      color: 'bg-teal-500'
    },
    {
      id: 'users',
      title: 'Users',
      description: 'Manage users',
      icon: '👤',
      path: '/admin/users',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">Manage all aspects of the OSM Portal</p>
          </div>

          {/* Admin Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminMenuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="group relative overflow-hidden rounded-lg bg-slate-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className={`absolute inset-0 ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.description}</p>
                  <div className="mt-4 flex items-center text-blue-400 group-hover:text-blue-300">
                    <span className="text-sm font-semibold">Manage</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-700 rounded-lg p-6">
              <div className="text-slate-400 text-sm font-semibold mb-2">Total Universities</div>
              <div className="text-3xl font-bold text-white">0</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <div className="text-slate-400 text-sm font-semibold mb-2">Total Departments</div>
              <div className="text-3xl font-bold text-white">0</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <div className="text-slate-400 text-sm font-semibold mb-2">Total Users</div>
              <div className="text-3xl font-bold text-white">0</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <div className="text-slate-400 text-sm font-semibold mb-2">Active Sessions</div>
              <div className="text-3xl font-bold text-white">0</div>
            </div>
          </div>
        </div>
      </div>
    );
}
