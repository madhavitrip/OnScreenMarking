import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Save, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { getSubjectConfig } from '../data/subjectConfig';

const ExaminerMarking = () => {
  const [selectedScript, setSelectedScript] = useState({
    id: 'OSM-2024-001',
    rollNo: '001',
    name: 'Aarav Kumar',
    subject: 'mathematics',
    date: '2024-04-28',
  });

  const [subjectConfig, setSubjectConfig] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [marks, setMarks] = useState({});
  const [totalObtained, setTotalObtained] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const config = getSubjectConfig(selectedScript.subject);
    setSubjectConfig(config);
    
    // Initialize expanded sections
    if (config) {
      const expanded = {};
      config.sections.forEach(section => {
        expanded[section.id] = true;
      });
      setExpandedSections(expanded);
    }
  }, [selectedScript.subject]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleMarkChange = (questionId, value) => {
    const numValue = Math.max(0, Math.min(value, 100));
    setMarks(prev => ({
      ...prev,
      [questionId]: numValue,
    }));
    calculateTotal();
  };

  const calculateTotal = () => {
    let total = 0;
    Object.values(marks).forEach(mark => {
      total += mark || 0;
    });
    setTotalObtained(total);
  };

  const handleSubmit = () => {
    if (totalObtained === 0) {
      alert('Please enter marks for at least one question');
      return;
    }
    setSubmitted(true);
    alert(`Marks submitted successfully!\nTotal: ${totalObtained}/${subjectConfig.totalMarks}`);
  };

  const handleReset = () => {
    setMarks({});
    setTotalObtained(0);
    setRemarks('');
    setSubmitted(false);
  };

  if (!subjectConfig) {
    return <div className="p-6">Loading...</div>;
  }

  const getQuestionTypeColor = (type) => {
    const colors = {
      MCQ: 'bg-blue-100 text-blue-800',
      SA: 'bg-green-100 text-green-800',
      LA: 'bg-purple-100 text-purple-800',
      CS: 'bg-orange-100 text-orange-800',
      NP: 'bg-red-100 text-red-800',
      EXP: 'bg-indigo-100 text-indigo-800',
      RC: 'bg-cyan-100 text-cyan-800',
      WS: 'bg-pink-100 text-pink-800',
      LIT: 'bg-yellow-100 text-yellow-800',
      GV: 'bg-teal-100 text-teal-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Examiner Marking Interface</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-blue-100 text-sm">Script ID</p>
            <p className="font-bold text-lg">{selectedScript.id}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Student Name</p>
            <p className="font-bold text-lg">{selectedScript.name}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Roll Number</p>
            <p className="font-bold text-lg">{selectedScript.rollNo}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Subject</p>
            <p className="font-bold text-lg">{subjectConfig.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Marking Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Script Viewer */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Answer Sheet</h2>
            <div className="bg-gray-100 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
              <p className="text-gray-600 text-lg">📄 Scanned Answer Sheet</p>
              <p className="text-gray-500 text-sm mt-2">High-resolution scanned image would be displayed here</p>
            </div>
          </div>

          {/* Marking Sections */}
          <div className="space-y-4">
            {subjectConfig.sections.map((section) => (
              <div key={section.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 p-4 flex items-center justify-between transition-colors"
                >
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">{section.name}</h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">
                      {section.totalQuestions} Q | {section.totalMarks} Marks
                    </span>
                    {expandedSections[section.id] ? (
                      <ChevronUp size={20} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-600" />
                    )}
                  </div>
                </button>

                {/* Section Content */}
                {expandedSections[section.id] && (
                  <div className="p-4 border-t border-gray-200 space-y-3">
                    {section.questions.map((question) => {
                      const currentMark = marks[question.qNo] || 0;
                      const isFullMarks = currentMark === question.marks;
                      const isPartialMarks = currentMark > 0 && currentMark < question.marks;

                      return (
                        <div
                          key={question.qNo}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-bold text-gray-900">Q{question.qNo}</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getQuestionTypeColor(question.type)}`}>
                                  {question.type}
                                </span>
                                <span className="text-sm text-gray-600">Max: {question.marks} marks</span>
                              </div>
                            </div>

                            {/* Mark Input */}
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max={question.marks}
                                value={currentMark}
                                onChange={(e) => handleMarkChange(question.qNo, parseInt(e.target.value) || 0)}
                                disabled={submitted}
                                className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-200"
                              />
                              <span className="text-sm text-gray-600 font-medium">/ {question.marks}</span>

                              {/* Status Indicator */}
                              {isFullMarks && (
                                <CheckCircle size={20} className="text-green-500" />
                              )}
                              {isPartialMarks && (
                                <AlertCircle size={20} className="text-yellow-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - Summary & Actions */}
        <div className="space-y-4">
          {/* Score Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 border border-blue-200">
            <h3 className="font-bold text-gray-900 mb-4">Score Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Obtained:</span>
                <span className="text-3xl font-bold text-blue-600">{totalObtained}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Marks:</span>
                <span className="text-2xl font-bold text-gray-900">{subjectConfig.totalMarks}</span>
              </div>
              <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                  style={{ width: `${(totalObtained / subjectConfig.totalMarks) * 100}%` }}
                ></div>
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-gray-700">
                  {Math.round((totalObtained / subjectConfig.totalMarks) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Section-wise Summary */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Section-wise Marks</h3>
            <div className="space-y-2">
              {subjectConfig.sections.map((section) => {
                const sectionMarks = section.questions.reduce((sum, q) => {
                  return sum + (marks[q.qNo] || 0);
                }, 0);

                return (
                  <div key={section.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700">{section.name}</span>
                    <span className="font-bold text-gray-900">
                      {sectionMarks}/{section.totalMarks}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Remarks */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-3">Examiner Remarks</h3>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={submitted}
              placeholder="Add any remarks or comments..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none disabled:bg-gray-100"
              rows="4"
            />
          </div>

          {/* Status */}
          {submitted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle size={20} />
                <span className="font-medium">Marks Submitted</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <Save size={20} />
              Submit Marks
            </button>
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <RotateCcw size={20} />
              Reset
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-2">Instructions</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Enter marks for each question</li>
              <li>• Marks cannot exceed max marks</li>
              <li>• Review before submitting</li>
              <li>• Add remarks if needed</li>
              <li>• Submit to finalize</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExaminerMarking;
