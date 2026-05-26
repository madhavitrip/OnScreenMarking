import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  X,
  Search,
  CheckCircle2,
  ChevronLeft,
  Users,
  Clock,
  AlertCircle,
  Loader
} from 'lucide-react';
import apiCall from '../services/api';
import { decryptId } from '../utils/encryption';

export default function ScriptAllocation() {
  const [searchParams] = useSearchParams();
  const encryptedProjectId = searchParams.get('projectId');
  const projectId = encryptedProjectId ? decryptId(encryptedProjectId) : null;
  const sessionId = searchParams.get('sessionId');

  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [paperInfo, setPaperInfo] = useState(null);
  const [scripts, setScripts] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allocationData, setAllocationData] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, [projectId, sessionId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch papers for the project
      let papersUrl = '/papers';
      if (projectId) {
        papersUrl += `?projectId=${projectId}`;
      }
      const papersData = await apiCall(papersUrl);
      setPapers(papersData || []);
    } catch (err) {
      setError('Failed to fetch papers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaperSelect = async (paper) => {
    setSelectedPaper(paper);
    setPaperInfo(paper);
    setLoading(true);
    try {
      // Fetch scripts for this paper
      const scriptsData = await apiCall(`/scripts?paperId=${paper.paperId}`);
      setScripts(scriptsData || []);

      // Fetch examiners for this paper
      const examinersData = await apiCall(`/PaperExaminers/paper/${paper.paperId}`);
      setExaminers(examinersData || []);

      // Initialize allocation data
      const allocation = {};
      (scriptsData || []).forEach(script => {
        allocation[script.scriptId] = null;
      });
      setAllocationData(allocation);
    } catch (err) {
      setError('Failed to fetch paper details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateScript = async (scriptId, examinerId) => {
    try {
      await apiCall('/Allocation', {
        method: 'POST',
        body: JSON.stringify({
          scriptId: scriptId,
          examinerId: examinerId,
          paperId: selectedPaper.paperId
        })
      });

      setAllocationData(prev => ({
        ...prev,
        [scriptId]: examinerId
      }));

      setSuccess('Script allocated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to allocate script');
      console.error(err);
    }
  };

  const handleRemoveAllocation = async (scriptId) => {
    try {
      await apiCall(`/Allocation/${scriptId}`, {
        method: 'DELETE'
      });

      setAllocationData(prev => ({
        ...prev,
        [scriptId]: null
      }));

      setSuccess('Allocation removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to remove allocation');
      console.error(err);
    }
  };

  const pendingCount = scripts.filter(s => !allocationData[s.scriptId]).length;
  const allocatedCount = scripts.filter(s => allocationData[s.scriptId]).length;

  const filteredScripts = scripts.filter(script =>
    script.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    script.rollNo?.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-blue-600" />
                Script Allocation
              </h1>
              <p className="text-sm text-gray-500">Allocate answer scripts to examiners</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-3">
            <CheckCircle2 size={20} />
            {success}
          </div>
        )}

        {/* Step 1: Select Paper */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
              1
            </div>
            Select Paper
          </h2>

          {loading && papers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-blue-600" size={24} />
            </div>
          ) : papers.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-600 font-medium">No papers found for this project</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {papers.map(paper => (
                <button
                  key={paper.paperId}
                  onClick={() => handlePaperSelect(paper)}
                  className={`p-4 border-2 transition-all text-left ${
                    selectedPaper?.paperId === paper.paperId
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{paper.paperName}</div>
                  <div className="text-slate-600 text-sm">Code: {paper.paperCode}</div>
                  <div className="text-slate-600 text-sm">Max Marks: {paper.maxMarks}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Paper Info & Stats */}
        {selectedPaper && (
          <>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{paperInfo?.paperName}</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Code:</span> {paperInfo?.paperCode}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Max Marks:</span> {paperInfo?.maxMarks}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Questions:</span> {paperInfo?.totalQuestions}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-3">Associated Subjects:</p>
                  <div className="flex flex-wrap gap-2">
                    {paperInfo?.subjectPapers?.map(subject => (
                      <span
                        key={subject.subjectId}
                        className="px-3 py-1 bg-blue-200 rounded-full text-xs font-medium"
                      >
                        {subject.subject?.subjectName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{pendingCount}</p>
                </div>
                <Clock className="text-yellow-500" size={32} />
              </div>

              <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Allocated</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{allocatedCount}</p>
                </div>
                <CheckCircle2 className="text-green-500" size={32} />
              </div>

              <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Subject Experts</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{examiners.length}</p>
                </div>
                <Users className="text-blue-500" size={32} />
              </div>
            </div>

            {/* Main Content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin text-blue-600" size={32} />
              </div>
            ) : scripts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 font-medium">No pending scripts for this paper</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Scripts to Allocate</h3>
                </div>

                <div className="p-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search by student name or roll number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {filteredScripts.map(script => (
                      <div key={script.scriptId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition">
                        <div>
                          <p className="font-semibold text-gray-900">{script.studentName}</p>
                          <p className="text-sm text-gray-600">Roll No: {script.rollNo}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {allocationData[script.scriptId] ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                                Allocated
                              </span>
                              <button
                                onClick={() => handleRemoveAllocation(script.scriptId)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAllocateScript(script.scriptId, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              <option value="">Assign Examiner</option>
                              {examiners.map(examiner => (
                                <option key={examiner.examinerId} value={examiner.examinerId}>
                                  {examiner.examinerName}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
