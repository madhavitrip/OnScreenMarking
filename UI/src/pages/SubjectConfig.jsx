import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Award,
  Hash,
  ListTodo,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Filter,
  Users
} from 'lucide-react';
import { subjectService, sectionService, paperService } from '../services';
import { useEffect, useState } from 'react';
import apiCall from '../services/api';

export default function SubjectConfig() {
  const [universities, setUniversities] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [papers, setPapers] = useState([]);
  const [sections, setSections] = useState([]);
  
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    name: '',
    description: '',
    startQuestion: 1,
    endQuestion: 10,
    totalMarks: 10,
    maxQuestionsToAttempt: 10,
  });
  
  const [questions, setQuestions] = useState([]);
  const [showQuestionPreview, setShowQuestionPreview] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [userProfile, setUserProfile] = useState(null);
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    fetchProfile();
    fetchUniversities();
  }, []);

  const fetchProfile = async () => {
    try {
      // Fetch current user details using token
      const response = await apiCall('/Auth/profile');
      setUserProfile(response);
      
      if (response.universityId) {
        setSelectedUniversity(response.universityId.toString());
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  useEffect(() => {
    if (selectedUniversity) {
      fetchSubjects();
    }
  }, [selectedUniversity]);

  useEffect(() => {
    if (selectedPaper) {
      fetchSections();
      setCurrentStep(3);
    } else if (selectedSubject) {
      fetchPapers();
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [selectedSubject, selectedPaper]);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const data = await subjectService.getAllUniversities();
      setUniversities(data);
      
      const storedUniId = userProfile?.universityId || localStorage.getItem('universityId');
      if (storedUniId) {
        setSelectedUniversity(storedUniId.toString());
      }
    } catch (err) {
      setError('Failed to fetch universities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const subjectsData = await subjectService.getAllSubjects();
      
      // Fetch paper counts for each subject in parallel
      const subjectsWithCounts = await Promise.all(
        subjectsData.map(async (subject) => {
          try {
            const papers = await subjectService.getSubjectPapers(subject.subjectId);
            return { ...subject, paperCount: papers.length };
          } catch (e) {
            return { ...subject, paperCount: 0 };
          }
        })
      );
      
      setSubjects(subjectsWithCounts);
    } catch (err) {
      setError('Failed to fetch subjects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const data = await paperService.getAllPapers();
      const filtered = data.filter(p => p.subjectId === selectedSubject.subjectId);
      setPapers(filtered);
    } catch (err) {
      setError('Failed to fetch papers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      const data = await sectionService.getAllSections(selectedPaper.paperId);
      setSections(data);
    } catch (err) {
      setError('Failed to fetch sections');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionFormChange = (e) => {
    const { name, value } = e.target;
    setSectionForm(prev => ({
      ...prev,
      [name]: name === 'startQuestion' || name === 'endQuestion' || name === 'totalMarks' || name === 'maxQuestionsToAttempt'
        ? parseInt(value) || 0
        : value
    }));
  };

  const generateQuestions = () => {
    const { startQuestion, endQuestion, totalMarks } = sectionForm;
    const totalQuestions = endQuestion - startQuestion + 1;
    const marksPerQuestion = totalMarks / totalQuestions;

    const generatedQuestions = [];
    for (let i = startQuestion; i <= endQuestion; i++) {
      generatedQuestions.push({
        questionNo: i,
        marks: parseFloat(marksPerQuestion.toFixed(2)),
        type: '',
        isOptional: false,
        optionalGroupCode: '',
      });
    }
    setQuestions(generatedQuestions);
    setShowQuestionPreview(true);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: field === 'marks' ? parseFloat(value) || 0 : value
    };
    setQuestions(updatedQuestions);
  };

  const handleEditSection = (section) => {
    setSectionForm({
      name: section.name,
      description: section.description,
      startQuestion: section.startQuestion,
      endQuestion: section.endQuestion,
      totalMarks: section.totalMarks,
      maxQuestionsToAttempt: section.maxQuestionsToAttempt,
    });
    setQuestions(section.questions || []);
    setEditingSectionId(section.id);
    setShowSectionForm(true);
    setShowQuestionPreview(true);
  };

  const handleSaveSection = async () => {
    if (questions.some(q => !q.type)) {
      setError('Please select a type for all questions');
      return;
    }

    try {
      setLoading(true);
      const sectionData = {
        ...sectionForm,
        paperId: selectedPaper.paperId,
        questions: questions.map(q => ({
          ...q,
          marks: parseFloat(q.marks)
        }))
      };

      if (editingSectionId) {
        await sectionService.updateSection(editingSectionId, sectionData);
        setSuccess('Section updated successfully');
      } else {
        await sectionService.createSection(sectionData);
        setSuccess('Section created successfully');
      }

      setShowSectionForm(false);
      setShowQuestionPreview(false);
      setEditingSectionId(null);
      setSectionForm({
        name: '',
        description: '',
        startQuestion: 1,
        endQuestion: 10,
        totalMarks: 10,
        maxQuestionsToAttempt: 10,
      });
      setQuestions([]);
      fetchSections();
    } catch (err) {
      setError('Failed to save section');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        setLoading(true);
        await sectionService.deleteSection(sectionId);
        setSuccess('Section deleted successfully!');
        await fetchSections();
      } catch (err) {
        setError('Failed to delete section');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getQuestionTypeColor = (type) => {
    const colors = {
      MCQ: 'bg-blue-100 text-blue-800 border-blue-300',
      SA: 'bg-green-100 text-green-800 border-green-300',
      LA: 'bg-purple-100 text-purple-800 border-purple-300',
      CS: 'bg-orange-100 text-orange-800 border-orange-300',
      NP: 'bg-red-100 text-red-800 border-red-300',
      EXP: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      RC: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      WS: 'bg-pink-100 text-pink-800 border-pink-300',
      LIT: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      GV: 'bg-teal-100 text-teal-800 border-teal-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const calculateTotalSectionMarks = () => {
    return sections.reduce((total, section) => total + section.totalMarks, 0);
  };

  const isAddSectionDisabled = () => {
    if (!selectedPaper) return true;
    const totalSectionMarks = calculateTotalSectionMarks();
    return totalSectionMarks >= selectedPaper.maxMarks;
  };

  // Helper component for Stat Cards
  const StatCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:border-blue-300">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  // Helper component for Step Indicator
  const StepIndicator = ({ step, label, active, completed }) => (
    <div className={`flex flex-col items-center gap-2 ${active || completed ? 'text-blue-600' : 'text-gray-400'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
        completed ? 'bg-blue-600 border-blue-600 text-white' : 
        active ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm' : 
        'border-gray-200 bg-gray-50'
      }`}>
        {completed ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-bold">{step}</span>}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-blue-600' : ''}`}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Compact Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-3xl shadow-lg p-6 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Layers className="w-8 h-8 text-blue-100" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Subject Configuration
              </h1>
              <p className="text-blue-100/80 text-sm font-medium">
                Structure and manage examinations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8 bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-2xl">
            <StepIndicator step={1} label="Subject" active={currentStep === 1} completed={currentStep > 1} />
            <div className={`h-1 w-8 md:w-12 rounded-full ${currentStep > 1 ? 'bg-white' : 'bg-white/20'}`} />
            <StepIndicator step={2} label="Paper" active={currentStep === 2} completed={currentStep > 2} />
            <div className={`h-1 w-8 md:w-12 rounded-full ${currentStep > 2 ? 'bg-white' : 'bg-white/20'}`} />
            <StepIndicator step={3} label="Sections" active={currentStep === 3} completed={currentStep > 3} />
          </div>
        </div>

        {/* Notifications */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
          {error && (
            <div className="bg-white border-l-4 border-red-500 shadow-xl text-red-600 px-6 py-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-right duration-300">
              <AlertCircle className="w-5 h-5" />
              <p className="font-bold">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-white border-l-4 border-emerald-500 shadow-xl text-emerald-600 px-6 py-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-right duration-300">
              <CheckCircle2 className="w-5 h-5" />
              <p className="font-bold">{success}</p>
            </div>
          )}
        </div>

        {/* Step 1: Subject Selection (Insta-Story Style) */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Your Subjects</h2>
                    <p className="text-gray-500 text-sm">Select a subject to start configuring examination papers</p>
                  </div>
                </div>

                {!(userProfile?.universityId || localStorage.getItem('universityId')) && (
                  <div className="w-64">
                    <select
                      value={selectedUniversity}
                      onChange={(e) => setSelectedUniversity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select University</option>
                      {universities.map(uni => (
                        <option key={uni.universityId} value={uni.universityId}>{uni.universityName}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {subjects.length > 0 ? (
                <div className="relative">
                  <div className="flex gap-8 overflow-x-auto pb-6 pt-2 custom-scrollbar no-scrollbar">
                    {subjects.map(subject => (
                      <button
                        key={subject.subjectId}
                        onClick={() => setSelectedSubject(subject)}
                        className="flex flex-col items-center gap-3 group shrink-0"
                      >
                        <div className={`relative p-1 rounded-full transition-all duration-300 ${
                          selectedSubject?.subjectId === subject.subjectId 
                          ? 'bg-gradient-to-tr from-blue-600 to-indigo-500 scale-110 shadow-lg shadow-blue-500/20' 
                          : 'bg-gray-200 group-hover:bg-blue-300'
                        }`}>
                          <div className="bg-white rounded-full p-0.5">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold transition-colors ${
                              selectedSubject?.subjectId === subject.subjectId 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500'
                            }`}>
                              {subject.subjectName.substring(0, 2).toUpperCase()}
                              
                              {/* Paper Count Badge */}
                              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md border-2 border-white">
                                {subject.paperCount || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs font-bold transition-colors ${
                          selectedSubject?.subjectId === subject.subjectId ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-900'
                        }`}>
                          {subject.subjectName}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : selectedUniversity ? (
                <div className="h-40 flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-gray-400 text-sm font-medium">Fetching subjects...</p>
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                  <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm font-medium">Please select a university to view subjects</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Paper Selection */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border border-gray-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedSubject(null)}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl text-gray-600 transition-all active:scale-95"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Select Paper</h2>
                    <p className="text-gray-500 font-medium">Configure sections for <span className="text-blue-600 font-bold">{selectedSubject.subjectName}</span></p>
                  </div>
                </div>
              </div>

              {papers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {papers.map(paper => (
                    <button
                      key={paper.paperId}
                      onClick={() => setSelectedPaper(paper)}
                      className="group bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 p-8 rounded-3xl transition-all duration-300 text-left relative shadow-sm hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-gray-100 rounded-2xl group-hover:bg-blue-100 transition-colors">
                          <FileText className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
                        </div>
                        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 uppercase tracking-wider">
                          {paper.catchNo}
                        </div>
                      </div>
                      <div className="font-bold text-gray-900 text-xl mb-2 group-hover:text-blue-700 transition-colors">{paper.paperName}</div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Award className="w-4 h-4 text-blue-500" />
                          <span>Max Marks: <span className="text-gray-900 font-bold">{paper.maxMarks}</span></span>
                        </div>
                      </div>
                      <div className="mt-8 flex items-center text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                        Configure Sections <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem]">
                  <FileText className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-400 font-bold text-lg">No papers found for this subject</p>
                  <button 
                    onClick={() => setSelectedSubject(null)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-bold transition-all"
                  >
                    Go back to subjects
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Manage Sections */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Header & Stats in a single row */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedPaper(null)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-all active:scale-95"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">Section Management</h2>
                    <p className="text-gray-500 text-xs font-medium">{selectedSubject.subjectName} <ChevronRight className="inline w-3 h-3 mx-1" /> {selectedPaper.paperName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-grow max-w-2xl">
                  <div className="flex-grow grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 flex items-center gap-3">
                      <Award className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-[10px] text-blue-600 uppercase font-bold tracking-tight">Max</p>
                        <p className="text-sm font-bold text-gray-900">{selectedPaper.maxMarks}</p>
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-tight">Allocated</p>
                        <p className="text-sm font-bold text-gray-900">{calculateTotalSectionMarks()}</p>
                      </div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-2xl border border-red-100 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-[10px] text-red-600 uppercase font-bold tracking-tight">Left</p>
                        <p className="text-sm font-bold text-gray-900">{selectedPaper.maxMarks - calculateTotalSectionMarks()}</p>
                      </div>
                    </div>
                  </div>

                  {!showSectionForm && (
                    <button
                      onClick={() => {
                        setEditingSectionId(null);
                        setShowSectionForm(true);
                      }}
                      disabled={isAddSectionDisabled()}
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shrink-0 ${
                        isAddSectionDisabled()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                      Add Section
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Section Creation Form - Side by Side */}
            {showSectionForm && (
              <div className="bg-white border border-blue-200 rounded-3xl p-6 shadow-xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Layers className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {editingSectionId ? 'Edit Section' : 'Create Section'}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveSection}
                      disabled={loading}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50 text-sm"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setShowSectionForm(false);
                        setShowQuestionPreview(false);
                        setEditingSectionId(null);
                      }}
                      className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  {/* Left Column: Basic Info */}
                  <div className="xl:col-span-3 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-tight">Section Details</label>
                      <div className="space-y-3">
                        <input
                          type="text"
                          name="name"
                          value={sectionForm.name}
                          onChange={handleSectionFormChange}
                          className="w-full bg-white text-gray-900 px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          placeholder="Section Name"
                        />
                        <textarea
                          name="description"
                          value={sectionForm.description}
                          onChange={handleSectionFormChange}
                          className="w-full bg-white text-gray-900 px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none h-24 text-sm"
                          placeholder="Description"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-tight">Structure</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] text-gray-500 mb-1">Start Q#</p>
                          <input
                            type="number"
                            name="startQuestion"
                            value={sectionForm.startQuestion}
                            onChange={handleSectionFormChange}
                            className="w-full bg-white px-3 py-2 rounded-lg border border-gray-300 text-sm"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 mb-1">End Q#</p>
                          <input
                            type="number"
                            name="endQuestion"
                            value={sectionForm.endQuestion}
                            onChange={handleSectionFormChange}
                            className="w-full bg-white px-3 py-2 rounded-lg border border-gray-300 text-sm"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 mb-1">Marks</p>
                          <input
                            type="number"
                            name="totalMarks"
                            value={sectionForm.totalMarks}
                            onChange={handleSectionFormChange}
                            className="w-full bg-white px-3 py-2 rounded-lg border border-gray-300 text-sm"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 mb-1">Attempt</p>
                          <input
                            type="number"
                            name="maxQuestionsToAttempt"
                            value={sectionForm.maxQuestionsToAttempt}
                            onChange={handleSectionFormChange}
                            className="w-full bg-white px-3 py-2 rounded-lg border border-gray-300 text-sm"
                          />
                        </div>
                      </div>
                      {!showQuestionPreview && (
                        <button
                          onClick={generateQuestions}
                          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-bold transition-all"
                        >
                          Generate Questions
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Questions Grid */}
                  <div className="xl:col-span-9">
                    {showQuestionPreview ? (
                      <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                        <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-tight">Question Configuration</h4>
                          <span className="text-xs font-medium text-gray-500">{questions.length} Questions in this section</span>
                        </div>
                        <div className="overflow-auto flex-grow custom-scrollbar">
                          <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white z-10 shadow-sm">
                              <tr>
                                <th className="px-4 py-3 text-gray-600 text-[10px] font-bold uppercase tracking-wider">Q No</th>
                                <th className="px-4 py-3 text-gray-600 text-[10px] font-bold uppercase tracking-wider">Marks</th>
                                <th className="px-4 py-3 text-gray-600 text-[10px] font-bold uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-gray-600 text-[10px] font-bold uppercase tracking-wider">Optional</th>
                                <th className="px-4 py-3 text-gray-600 text-[10px] font-bold uppercase tracking-wider">Group</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {questions.map((q, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                  <td className="px-4 py-2 text-gray-900 font-bold text-sm">#{q.questionNo}</td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="number"
                                      value={q.marks}
                                      onChange={(e) => handleQuestionChange(idx, 'marks', e.target.value)}
                                      className="w-20 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                      step="0.5"
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <select
                                      value={q.type}
                                      onChange={(e) => handleQuestionChange(idx, 'type', e.target.value)}
                                      className={`w-full bg-gray-50 px-2 py-1.5 rounded-lg border text-sm outline-none ${
                                        !q.type ? 'border-red-200' : 'border-gray-200 focus:ring-1 focus:ring-blue-500'
                                      }`}
                                    >
                                      <option value="">Type</option>
                                      {['MCQ', 'SA', 'LA', 'CS', 'NP', 'EXP', 'RC', 'WS', 'LIT', 'GV'].map(type => (
                                        <option key={type} value={type}>{type}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={q.isOptional}
                                      onChange={(e) => handleQuestionChange(idx, 'isOptional', e.target.checked)}
                                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="text"
                                      value={q.optionalGroupCode || ''}
                                      onChange={(e) => handleQuestionChange(idx, 'optionalGroupCode', e.target.value)}
                                      className={`w-16 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200 text-xs ${!q.isOptional && 'opacity-30'}`}
                                      placeholder="Grp"
                                      disabled={!q.isOptional}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl min-h-[400px]">
                        <ListTodo className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium text-center px-10">
                          Complete the section details and click <span className="font-bold text-blue-600">Generate Questions</span> to configure individual marks and types.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Existing Sections List */}
            {sections.length > 0 && !showSectionForm && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2 px-2">
                  <Layers className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Configured Sections</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {sections.map(section => (
                    <div 
                      key={section.id} 
                      className="group bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-xl font-bold text-gray-900">{section.name}</h4>
                            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-200 uppercase">
                              Q{section.startQuestion} - Q{section.endQuestion}
                            </div>
                          </div>
                          <p className="text-gray-500 text-sm mb-6 max-w-2xl font-medium">{section.description || 'No description provided for this section.'}</p>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Total Marks</p>
                              <p className="text-gray-900 font-bold text-lg">{section.totalMarks}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">To Attempt</p>
                              <p className="text-gray-900 font-bold text-lg">{section.maxQuestionsToAttempt}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Questions</p>
                              <p className="text-gray-900 font-bold text-lg">{section.questions?.length || 0}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Avg Marks</p>
                              <p className="text-gray-900 font-bold text-lg">{(section.totalMarks / (section.endQuestion - section.startQuestion + 1)).toFixed(1)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEditSection(section)}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 hover:border-blue-200 transition-all font-bold shadow-sm"
                          >
                            <FileText className="w-4 h-4" />
                            View/Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-red-50 text-red-600 border border-gray-200 hover:border-red-200 transition-all font-bold shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sections.length === 0 && !showSectionForm && (
              <div className="h-[400px] flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] shadow-sm">
                <Layers className="w-16 h-16 text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">No sections configured yet</h3>
                <p className="text-gray-500 mb-6 font-medium">Start by adding a new section to define the paper structure</p>
                <button
                  onClick={() => setShowSectionForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                >
                  Create First Section
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
