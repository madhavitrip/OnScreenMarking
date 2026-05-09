import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Edit2, Save, Plus } from 'lucide-react';

const SubjectConfig = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [config, setConfig] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionFormData, setSectionFormData] = useState({
    name: '',
    description: '',
    startQuestion: 1,
    endQuestion: 1,
    totalQuestions: 1,
    totalMarks: 0
  });
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [editingQuestions, setEditingQuestions] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'https://localhost:7243/api';

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/subject`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      setError('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = async (subject) => {
    setSelectedSubject(subject);
    setSelectedPaper(null);
    setConfig(null);
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/subject/${subject.subjectId}/papers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPapers(data);
    } catch (err) {
      setError('Failed to fetch papers');
    } finally {
      setLoading(false);
    }
  };

  const handlePaperClick = async (paper) => {
    setSelectedPaper(paper);
    setShowSectionForm(false);
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/section?paperId=${paper.paperId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const sections = await response.json();
      
      // Build config object similar to original
      setConfig({
        name: paper.paperName,
        totalMarks: paper.maxMarks,
        sections: sections
      });
    } catch (err) {
      setError('Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!selectedPaper) {
      setError('Please select a paper first');
      return;
    }

    // Validate all questions have type set
    const invalidQuestions = previewQuestions.filter(q => !q.type || q.type === '');
    if (invalidQuestions.length > 0) {
      setError('All questions must have a type selected');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/section`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paperId: selectedPaper.paperId,
          name: sectionFormData.name,
          description: sectionFormData.description,
          startQuestion: sectionFormData.startQuestion,
          endQuestion: sectionFormData.endQuestion,
          totalQuestions: sectionFormData.totalQuestions,
          totalMarks: sectionFormData.totalMarks,
          questions: previewQuestions // Send all question details
        })
      });

      if (response.ok) {
        setSectionFormData({ name: '', description: '', startQuestion: 1, endQuestion: 1, totalQuestions: 1, totalMarks: 0 });
        setPreviewQuestions([]);
        setEditingQuestions({});
        setShowPreview(false);
        setShowSectionForm(false);
        // Refresh sections
        handlePaperClick(selectedPaper);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add section');
      }
    } catch (err) {
      setError('Error adding section');
    }
  };

  const handleGeneratePreview = () => {
    if (!sectionFormData.name) {
      setError('Section name is required');
      return;
    }
    if (sectionFormData.totalMarks <= 0) {
      setError('Total marks must be greater than 0');
      return;
    }
    if (sectionFormData.startQuestion > sectionFormData.endQuestion) {
      setError('Start question must be less than or equal to end question');
      return;
    }

    // Generate questions with default values
    const marksPerQuestion = sectionFormData.totalMarks / sectionFormData.totalQuestions;
    const questions = [];
    for (let i = sectionFormData.startQuestion; i <= sectionFormData.endQuestion; i++) {
      questions.push({
        questionNo: i,
        marks: marksPerQuestion,
        type: 'MCQ', // default type
        isOptional: false,
        optionalGroupCode: ''
      });
    }
    setPreviewQuestions(questions);
    setShowPreview(true);
    setError('');
  };

  const handleQuestionRangeChange = (startQ, endQ) => {
    const totalQ = endQ - startQ + 1;
    setSectionFormData(prev => ({
      ...prev,
      startQuestion: startQ,
      endQuestion: endQ,
      totalQuestions: totalQ
    }));

    // Generate preview questions
    const marksPerQuestion = prev.totalMarks > 0 ? prev.totalMarks / totalQ : 0;
    const questions = [];
    for (let i = startQ; i <= endQ; i++) {
      questions.push({
        questionNo: i,
        marks: marksPerQuestion
      });
    }
    setPreviewQuestions(questions);
  };

  const handleTotalMarksChange = (marks) => {
    setSectionFormData(prev => ({
      ...prev,
      totalMarks: marks
    }));

    // Recalculate marks per question
    if (sectionFormData.totalQuestions > 0) {
      const marksPerQuestion = marks / sectionFormData.totalQuestions;
      const updatedQuestions = previewQuestions.map(q => ({
        ...q,
        marks: marksPerQuestion
      }));
      setPreviewQuestions(updatedQuestions);
    }
  };

  const handleQuestionMarksChange = (questionNo, marks) => {
    setEditingQuestions(prev => ({
      ...prev,
      [questionNo]: marks
    }));

    const updatedQuestions = previewQuestions.map(q =>
      q.questionNo === questionNo ? { ...q, marks } : q
    );
    setPreviewQuestions(updatedQuestions);
  };

  const handleQuestionTypeChange = (questionNo, type) => {
    const updatedQuestions = previewQuestions.map(q =>
      q.questionNo === questionNo ? { ...q, type } : q
    );
    setPreviewQuestions(updatedQuestions);
  };

  const handleQuestionOptionalChange = (questionNo, isOptional) => {
    const updatedQuestions = previewQuestions.map(q =>
      q.questionNo === questionNo ? { ...q, isOptional } : q
    );
    setPreviewQuestions(updatedQuestions);
  };

  const handleQuestionGroupCodeChange = (questionNo, code) => {
    const updatedQuestions = previewQuestions.map(q =>
      q.questionNo === questionNo ? { ...q, optionalGroupCode: code } : q
    );
    setPreviewQuestions(updatedQuestions);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getQuestionTypeLabel = (type) => {
    const labels = {
      MCQ: 'Multiple Choice',
      SA: 'Short Answer',
      LA: 'Long Answer',
      CS: 'Case Study',
      NP: 'Numerical Problem',
      EXP: 'Experimental',
      RC: 'Reading Comprehension',
      WS: 'Writing Skills',
      LIT: 'Literature',
      GV: 'Grammar & Vocabulary',
    };
    return labels[type] || type;
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

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subject Configuration</h1>
        <p className="text-gray-600 mt-1">View and manage exam structure, sections, and question details</p>
      </div>

      {/* Subject Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Select Subject</h2>
        {loading && subjects.length === 0 ? (
          <div className="text-gray-600">Loading subjects...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {subjects.map((subject) => (
              <button
                key={subject.subjectId}
                onClick={() => handleSubjectClick(subject)}
                className={`p-4 rounded-lg font-medium transition-all ${
                  selectedSubject?.subjectId === subject.subjectId
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <p className="text-sm">{subject.subjectName}</p>
                <p className="text-xs mt-1 opacity-75">{subject.department?.name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Papers Selector */}
      {selectedSubject && papers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Select Paper</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {papers.map((paper) => (
              <button
                key={paper.paperId}
                onClick={() => handlePaperClick(paper)}
                className={`p-4 rounded-lg font-medium transition-all ${
                  selectedPaper?.paperId === paper.paperId
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <p className="text-sm">{paper.paperName}</p>
                <p className="text-xs mt-1 opacity-75">{paper.paperCode}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subject Overview */}
      {config && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 border border-blue-200">
              <p className="text-blue-600 text-sm font-medium">Paper Name</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{config.name}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6 border border-green-200">
              <p className="text-green-600 text-sm font-medium">Total Marks</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{config.totalMarks}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6 border border-purple-200">
              <p className="text-purple-600 text-sm font-medium">Total Sections</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{config.sections.length}</p>
            </div>
          </div>

          {/* Add Section Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowSectionForm(!showSectionForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <Plus size={20} />
              {showSectionForm ? 'Cancel' : 'Add Section'}
            </button>
          </div>

          {/* Add Section Form */}
          {showSectionForm && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Section</h2>
              
              {!showPreview ? (
                // Step 1: Configuration
                <form onSubmit={(e) => { e.preventDefault(); handleGeneratePreview(); }} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Section Name *</label>
                      <input
                        type="text"
                        value={sectionFormData.name}
                        onChange={(e) => setSectionFormData({ ...sectionFormData, name: e.target.value })}
                        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Section A"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Description</label>
                      <input
                        type="text"
                        value={sectionFormData.description}
                        onChange={(e) => setSectionFormData({ ...sectionFormData, description: e.target.value })}
                        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Optional description"
                      />
                    </div>
                  </div>

                  {/* Question Range */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Question Range</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Start Question *</label>
                        <input
                          type="number"
                          value={sectionFormData.startQuestion}
                          onChange={(e) => handleQuestionRangeChange(parseInt(e.target.value), sectionFormData.endQuestion)}
                          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 1"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">End Question *</label>
                        <input
                          type="number"
                          value={sectionFormData.endQuestion}
                          onChange={(e) => handleQuestionRangeChange(sectionFormData.startQuestion, parseInt(e.target.value))}
                          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 10"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Total Questions</label>
                        <input
                          type="number"
                          value={sectionFormData.totalQuestions}
                          disabled
                          className="w-full border border-gray-300 px-4 py-2 rounded-lg bg-gray-100 text-gray-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Marks Configuration */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Marks Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Total Marks *</label>
                        <input
                          type="number"
                          value={sectionFormData.totalMarks}
                          onChange={(e) => handleTotalMarksChange(parseInt(e.target.value))}
                          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="e.g., 10"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Marks Per Question</label>
                        <input
                          type="number"
                          value={sectionFormData.totalQuestions > 0 ? (sectionFormData.totalMarks / sectionFormData.totalQuestions).toFixed(2) : 0}
                          disabled
                          className="w-full border border-gray-300 px-4 py-2 rounded-lg bg-gray-100 text-gray-600"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Questions will be auto-created with marks distributed equally. You can customize each question in the next step.</p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Preview Questions
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSectionForm(false);
                        setSectionFormData({ name: '', description: '', startQuestion: 1, endQuestion: 1, totalQuestions: 1, totalMarks: 0 });
                        setPreviewQuestions([]);
                        setEditingQuestions({});
                      }}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // Step 2: Preview & Verification
                <form onSubmit={handleAddSection} className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Step 2: Verify & Customize Questions</h3>
                    <p className="text-sm text-gray-600">Review the questions below. Set the question type and optional details for each question. All fields are required.</p>
                  </div>

                  {/* Questions Table */}
                  <div className="overflow-x-auto border border-gray-300 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Q No</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Marks</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type *</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Optional</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Group Code</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {previewQuestions.map((q) => (
                          <tr key={q.questionNo} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-900 font-medium">Q{q.questionNo}</td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={editingQuestions[q.questionNo] !== undefined ? editingQuestions[q.questionNo] : q.marks}
                                onChange={(e) => handleQuestionMarksChange(q.questionNo, parseFloat(e.target.value))}
                                className="w-20 border border-gray-300 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.1"
                                min="0"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={q.type}
                                onChange={(e) => handleQuestionTypeChange(q.questionNo, e.target.value)}
                                className="w-full border border-gray-300 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              >
                                <option value="">Select Type</option>
                                <option value="MCQ">MCQ</option>
                                <option value="SA">Short Answer</option>
                                <option value="LA">Long Answer</option>
                                <option value="CS">Case Study</option>
                                <option value="NP">Numerical</option>
                                <option value="EXP">Experimental</option>
                                <option value="RC">Reading</option>
                                <option value="WS">Writing</option>
                                <option value="LIT">Literature</option>
                                <option value="GV">Grammar</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={q.isOptional}
                                onChange={(e) => handleQuestionOptionalChange(q.questionNo, e.target.checked)}
                                className="w-4 h-4 rounded"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={q.optionalGroupCode || ''}
                                onChange={(e) => handleQuestionGroupCodeChange(q.questionNo, e.target.value)}
                                placeholder="e.g., A1"
                                className="w-20 border border-gray-300 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!q.isOptional}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Section</p>
                        <p className="font-semibold text-gray-900">{sectionFormData.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Questions</p>
                        <p className="font-semibold text-gray-900">{sectionFormData.totalQuestions}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Marks</p>
                        <p className="font-semibold text-gray-900">{sectionFormData.totalMarks}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Marks/Q</p>
                        <p className="font-semibold text-gray-900">{(sectionFormData.totalMarks / sectionFormData.totalQuestions).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Save Section & Questions
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPreview(false);
                        setPreviewQuestions([]);
                      }}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Back to Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSectionForm(false);
                        setShowPreview(false);
                        setSectionFormData({ name: '', description: '', startQuestion: 1, endQuestion: 1, totalQuestions: 1, totalMarks: 0 });
                        setPreviewQuestions([]);
                        setEditingQuestions({});
                      }}
                      className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Sections Detail */}
          <div className="space-y-4">
            {config.sections.map((section) => (
              <div key={section.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 p-6 flex items-center justify-between transition-colors"
                >
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900">{section.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Questions: {section.totalQuestions}</p>
                      <p className="text-lg font-bold text-gray-900">Marks: {section.totalMarks}</p>
                    </div>
                    {expandedSections[section.id] ? (
                      <ChevronUp size={24} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={24} className="text-gray-600" />
                    )}
                  </div>
                </button>

                {/* Section Content */}
                {expandedSections[section.id] && (
                  <div className="p-6 border-t border-gray-200">
                    {/* Section Statistics */}
                    <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-xs text-blue-600 font-medium">Total Questions</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">{section.totalQuestions}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-xs text-green-600 font-medium">Total Marks</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">{section.totalMarks}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-xs text-purple-600 font-medium">Avg Marks/Q</p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {(section.totalMarks / section.totalQuestions).toFixed(1)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Created: {new Date(section.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary Statistics */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6 border border-blue-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Exam Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {config.sections.map((section) => (
                <div key={section.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-600">{section.name}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-lg font-bold text-gray-900">{section.totalMarks} marks</p>
                    <p className="text-xs text-gray-500">{section.totalQuestions} questions</p>
                    <p className="text-xs text-gray-500">
                      {((section.totalMarks / config.totalMarks) * 100).toFixed(0)}% of total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Question Type Legend</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { type: 'MCQ', label: 'Multiple Choice' },
            { type: 'SA', label: 'Short Answer' },
            { type: 'LA', label: 'Long Answer' },
            { type: 'CS', label: 'Case Study' },
            { type: 'NP', label: 'Numerical' },
            { type: 'EXP', label: 'Experimental' },
            { type: 'RC', label: 'Reading' },
            { type: 'WS', label: 'Writing' },
            { type: 'LIT', label: 'Literature' },
            { type: 'GV', label: 'Grammar' },
          ].map((item) => (
            <div key={item.type} className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getQuestionTypeColor(item.type)}`}>
                {item.type}
              </span>
              <span className="text-xs text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectConfig;
