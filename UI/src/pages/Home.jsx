import { useState } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, BarChart3, Users } from 'lucide-react';

const Home = () => {
  const [stats] = useState({
    totalScripts: 450,
    evaluated: 320,
    pending: 130,
    inProgress: 25,
    averageScore: 78.5,
  });

  const recentScripts = [
    { id: 'OSM-2024-001', subject: 'Mathematics', status: 'Completed', score: 85, time: '2 hours ago' },
    { id: 'OSM-2024-002', subject: 'Physics', status: 'In Progress', score: null, time: 'Now' },
    { id: 'OSM-2024-003', subject: 'Chemistry', status: 'Pending', score: null, time: '5 mins ago' },
    { id: 'OSM-2024-004', subject: 'English', status: 'Completed', score: 92, time: '1 hour ago' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Evaluation Dashboard</h1>
        <p className="text-gray-600 mt-1">On-Screen Marking System - Class 12 Board Exams</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Scripts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalScripts}</p>
            </div>
            <FileText className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Evaluated</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.evaluated}</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.inProgress}</p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
            </div>
            <AlertCircle className="text-red-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.averageScore}%</p>
            </div>
            <BarChart3 className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Evaluation Progress</h2>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-bold text-gray-900">{Math.round((stats.evaluated / stats.totalScripts) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${(stats.evaluated / stats.totalScripts) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Scripts */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Recent Scripts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Script ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentScripts.map((script) => (
                <tr key={script.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{script.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{script.subject}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        script.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : script.status === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {script.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{script.score || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{script.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;
