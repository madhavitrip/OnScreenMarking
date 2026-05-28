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
  Loader,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiCall from '../services/api';
import paperService from '../services/paperService';
import allocationService from '../services/allocationService';
import sectionService from '../services/sectionService';
import { decryptId } from '../utils/encryption';

export default function ScriptAllocation() {
  const [searchParams] = useSearchParams();
  const encryptedProjectId = searchParams.get('projectId');
  const projectId = encryptedProjectId ? decryptId(encryptedProjectId) : null;
  const sessionId = searchParams.get('sessionId');
  const { userType, universityId: userUniversityId } = useAuth();
  const universityIdFromUrl = searchParams.get('universityId');
  const activeUniversityId = userType === 'coordinator' ? userUniversityId : universityIdFromUrl;

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
  
  // Bulk allocation state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkMode, setBulkMode] = useState('even'); // 'even' or 'custom'
  const [examinerCounts, setExaminerCounts] = useState({});
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [projectId, sessionId, activeUniversityId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch papers for the project
      let papersData;
      if (projectId) {
        papersData = await paperService.getPapersByProject(projectId);
      } else {
        papersData = await paperService.getAllPapers(activeUniversityId);
      }
      setPapers(papersData || []);
    } catch (err) {
      setError('Failed to fetch papers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaperSelect = async (paper) => {
    setError('');
    setSuccess('');
    setSelectedPaper(paper);
    setPaperInfo(paper);
    setLoading(true);
    try {
      // First verify if paper sections are configured
      const sectionsData = await sectionService.getAllSections(paper.paperId);
      if (!sectionsData || sectionsData.length === 0) {
        setError(`Warning: Paper "${paper.paperName}" does not have sections or questions configured yet. You must complete the Subject & Paper configuration under "Sessions & Projects" first, otherwise scripts cannot be allocated.`);
        setSelectedPaper(null);
        setPaperInfo(null);
        setScripts([]);
        setExaminers([]);
        return;
      }

      // Fetch scripts for this paper
      const scriptsData = await apiCall(`/scripts?paperId=${paper.paperId}`);
      setScripts(scriptsData || []);

      // Fetch examiners for this paper
      const examinersData = await apiCall(`/PaperExaminers/paper/${paper.paperId}`);
      console.log(examinersData)
      setExaminers(examinersData || []);

      // Initialize allocation data
      const allocation = {};
      (scriptsData || []).forEach(script => {
        allocation[script.Id] = null;
      });
      setAllocationData(allocation);
    } catch (err) {
      setError('Failed to fetch paper details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateScript = async (Id, examinerId) => {
    try {
      await allocationService.createAllocation(Id, examinerId);

      setAllocationData(prev => ({
        ...prev,
        [Id]: examinerId
      }));

      setSuccess('Script allocated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to allocate script');
      console.error(err);
    }
  };

  const handleRemoveAllocation = async (Id) => {
    try {
      // Get the allocation ID first
      const allocation = await allocationService.getScriptAllocation(Id);
      if (allocation && allocation.id) {
        await allocationService.cancelAllocation(allocation.id);
      }

      setAllocationData(prev => ({
        ...prev,
        [Id]: null
      }));

      setSuccess('Allocation removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to remove allocation');
      console.error(err);
    }
  };

  const pendingCount = scripts.filter(s => !allocationData[s.Id]).length;
  const allocatedCount = scripts.filter(s => allocationData[s.Id]).length;

  const filteredScripts = scripts.filter(script =>
    script.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    script.rollNo?.includes(searchQuery)
  );

  const openBulkModal = () => {
    // Initialize examiner counts
    const counts = {};
    examiners.forEach(examiner => {
      counts[examiner.examinerId] = 0;
    });
    setExaminerCounts(counts);
    setShowBulkModal(true);
  };

  const calculateEvenDistribution = () => {
    const pendingScripts = scripts.filter(s => !allocationData[s.Id]);
    const activeExaminers = examiners.filter(e => e.examinerId);
    
    if (activeExaminers.length === 0 || pendingScripts.length === 0) {
      setError('No pending scripts or examiners available');
      return;
    }

    const counts = {};
    const baseCount = Math.floor(pendingScripts.length / activeExaminers.length);
    const remainder = pendingScripts.length % activeExaminers.length;

    activeExaminers.forEach((examiner, index) => {
      counts[examiner.examinerId] = baseCount + (index < remainder ? 1 : 0);
    });

    setExaminerCounts(counts);
  };

  const handleBulkAllocate = async () => {
    try {
      setBulkLoading(true);
      const pendingScripts = scripts.filter(s => !allocationData[s.Id]);
      
      if (pendingScripts.length === 0) {
        setError('No pending scripts to allocate');
        return;
      }

      // Validate that total allocation matches pending scripts
      const totalAllocated = Object.values(examinerCounts).reduce((sum, count) => sum + count, 0);
      if (totalAllocated !== pendingScripts.length) {
        setError(`Total allocation (${totalAllocated}) must equal pending scripts (${pendingScripts.length})`);
        return;
      }

      // Create allocations array with counts
      const allocations = Object.entries(examinerCounts)
        .map(([examinerId, count]) => ({
          examinerId: parseInt(examinerId),
          count: count
        }))
        .filter(alloc => alloc.count > 0);

      // Perform bulk allocation
      const response = await allocationService.bulkAllocateScripts(selectedPaper.paperId, allocations);

      // Update local state based on actual assignments returned by backend
      const newAllocationData = { ...allocationData };
      if (response && response.results) {
        response.results.forEach(res => {
          newAllocationData[res.scriptId] = res.examinerId;
        });
      }
      setAllocationData(newAllocationData);

      setSuccess(`Successfully allocated ${response?.results?.length || totalAllocated} scripts randomly in backend`);
      setShowBulkModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to perform bulk allocation');
      console.error(err);
    } finally {
      setBulkLoading(false);
    }
  };

  const updateExaminerCount = (examinerId, count) => {
    setExaminerCounts(prev => ({
      ...prev,
      [examinerId]: Math.max(0, count)
    }));
  };

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

            {/* Bulk Allocation Button */}
            {pendingCount > 0 && (
              <div className="mb-6 flex gap-3">
                <button
                  onClick={openBulkModal}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <Zap size={18} />
                  Bulk Allocate
                </button>
              </div>
            )}

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
                      <div key={script.Id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition">
                        <div>
                          <p className="font-semibold text-gray-900">{script.studentName}</p>
                          <p className="text-sm text-gray-600">Roll No: {script.rollNo}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {allocationData[script.Id] ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                                Allocated
                              </span>
                              <button
                                onClick={() => handleRemoveAllocation(script.Id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAllocateScript(script.Id, e.target.value);
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

      {/* Bulk Allocation Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="text-purple-600" size={24} />
                  Bulk Allocate Scripts
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {scripts.filter(s => !allocationData[s.Id]).length} pending scripts to allocate
                </p>
              </div>
              <button 
                onClick={() => setShowBulkModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Mode Selection */}
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-700 mb-3">Allocation Mode</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setBulkMode('even')}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${
                      bulkMode === 'even'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Even Distribution
                  </button>
                  <button
                    onClick={() => setBulkMode('custom')}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${
                      bulkMode === 'custom'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Custom Distribution
                  </button>
                </div>
              </div>

              {/* Even Distribution */}
              {bulkMode === 'even' && (
                <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-sm text-gray-700 mb-4">
                    Click "Calculate" to distribute {scripts.filter(s => !allocationData[s.Id]).length} scripts evenly among {examiners.length} examiners.
                  </p>
                  <button
                    onClick={calculateEvenDistribution}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
                  >
                    Calculate Even Distribution
                  </button>
                </div>
              )}

              {/* Examiner Allocation Table */}
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-700 mb-3">Examiner Allocation</p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {examiners.map(examiner => (
                    <div key={examiner.examinerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <img 
                          src={examiner.profileImage || "https://ui-avatars.com/api/?name=" + examiner.examinerName} 
                          alt="" 
                          className="w-8 h-8 rounded-full bg-gray-200"
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-800">{examiner.examinerName}</p>
                          <p className="text-xs text-gray-500">ID: {examiner.examinerId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateExaminerCount(examiner.examinerId, (examinerCounts[examiner.examinerId] || 0) - 1)}
                          className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={examinerCounts[examiner.examinerId] || 0}
                          onChange={(e) => updateExaminerCount(examiner.examinerId, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                          onClick={() => updateExaminerCount(examiner.examinerId, (examinerCounts[examiner.examinerId] || 0) + 1)}
                          className="px-2 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">Total to Allocate:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {Object.values(examinerCounts).reduce((sum, count) => sum + count, 0)} / {scripts.filter(s => !allocationData[s.Id]).length}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAllocate}
                  disabled={bulkLoading || Object.values(examinerCounts).reduce((sum, count) => sum + count, 0) !== scripts.filter(s => !allocationData[s.Id]).length}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {bulkLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Allocating...
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      Allocate Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
