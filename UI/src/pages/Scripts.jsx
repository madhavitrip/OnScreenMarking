import { useState } from 'react';
import { Search, Filter, Eye, Download, CheckCircle, Clock } from 'lucide-react';

const Scripts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedScript, setSelectedScript] = useState(null);

  const scripts = [
    { id: 'OSM-2024-001', rollNo: '001', name: 'Aarav Kumar', subject: 'Mathematics', status: 'Completed', score: 85, examiner: 'Dr. Sharma', date: '2024-04-28' },
    { id: 'OSM-2024-002', rollNo: '002', name: 'Bhavna Singh', subject: 'Physics', status: 'In Progress', score: null, examiner: 'Dr. Patel', date: '2024-04-28' },
    { id: 'OSM-2024-003', rollNo: '003', name: 'Chirag Verma', subject: 'Chemistry', status: 'Pending', score: null, examiner: 'Unassigned', date: '2024-04-28' },
    { id: 'OSM-2024-004', rollNo: '004', name: 'Divya Nair', subject: 'English', status: 'Completed', score: 92, examiner: 'Dr. Gupta', date: '2024-04-28' },
    { id: 'OSM-2024-005', rollNo: '005', name: 'Eshan Reddy', subject: 'Biology', status: 'Pending', score: null, examiner: 'Unassigned', date: '2024-04-28' },
    { id: 'OSM-2024-006', rollNo: '006', name: 'Fiona Das', subject: 'Mathematics', status: 'Completed', score: 78, examiner: 'Dr. Sharma', date: '2024-04-28' },
  ];

  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.rollNo.includes(searchTerm) ||
                         script.id.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || script.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Answer Scripts</h1>
        <p className="text-gray-600 mt-1">Manage and evaluate student answer sheets</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, roll number, or script ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scripts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Script ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredScripts.map((script) => (
                <tr key={script.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{script.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{script.rollNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{script.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{script.subject}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                        script.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : script.status === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {script.status === 'Completed' ? <CheckCircle size={14} /> : <Clock size={14} />}
                      {script.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{script.score || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedScript(script)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Script"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Script Viewer Modal */}
      {selectedScript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedScript.name}</h2>
                <p className="text-gray-600 text-sm mt-1">{selectedScript.subject} - {selectedScript.id}</p>
              </div>
              <button
                onClick={() => setSelectedScript(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Script Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-medium">Roll Number</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{selectedScript.rollNo}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-medium">Subject</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{selectedScript.subject}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-medium">Examiner</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{selectedScript.examiner}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-medium">Date</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{selectedScript.date}</p>
                </div>
              </div>

              {/* Script Image Placeholder */}
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <div className="bg-white rounded-lg p-12 border-2 border-dashed border-gray-300">
                  <p className="text-gray-600 text-lg">📄 Scanned Answer Sheet</p>
                  <p className="text-gray-500 text-sm mt-2">High-resolution scanned image would be displayed here</p>
                </div>
              </div>

              {/* Marking Tools */}
              {selectedScript.status !== 'Completed' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Marking Tools</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button className="bg-white border border-gray-300 hover:border-blue-500 rounded-lg p-3 text-center transition-colors">
                      <p className="text-2xl">✓</p>
                      <p className="text-xs font-medium text-gray-700 mt-1">Tick</p>
                    </button>
                    <button className="bg-white border border-gray-300 hover:border-blue-500 rounded-lg p-3 text-center transition-colors">
                      <p className="text-2xl">⭕</p>
                      <p className="text-xs font-medium text-gray-700 mt-1">Circle</p>
                    </button>
                    <button className="bg-white border border-gray-300 hover:border-blue-500 rounded-lg p-3 text-center transition-colors">
                      <p className="text-2xl">_</p>
                      <p className="text-xs font-medium text-gray-700 mt-1">Underline</p>
                    </button>
                    <button className="bg-white border border-gray-300 hover:border-blue-500 rounded-lg p-3 text-center transition-colors">
                      <p className="text-2xl">💬</p>
                      <p className="text-xs font-medium text-gray-700 mt-1">Comment</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Score Input */}
              {selectedScript.status !== 'Completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Enter Score</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Enter marks out of 100"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                    <button className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                      Submit Score
                    </button>
                  </div>
                </div>
              )}

              {selectedScript.status === 'Completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <p className="text-green-800 font-medium">✓ Evaluation Completed</p>
                  <p className="text-green-700 text-sm mt-1">Score: {selectedScript.score}/100</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scripts;
