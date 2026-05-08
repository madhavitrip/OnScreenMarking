import { useState } from 'react';
import { getAllSubjects, getSubjectConfig } from '../data/subjectConfig';
import { ChevronDown, ChevronUp, Edit2, Save } from 'lucide-react';

const SubjectConfig = () => {
  const [selectedSubject, setSelectedSubject] = useState('mathematics');
  const [expandedSections, setExpandedSections] = useState({});
  const [editMode, setEditMode] = useState(false);

  const subjects = getAllSubjects();
  const config = getSubjectConfig(selectedSubject);

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

  if (!config) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subject Configuration</h1>
        <p className="text-gray-600 mt-1">View and manage exam structure, sections, and question details</p>
      </div>

      {/* Subject Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Select Subject</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {subjects.map((subject) => (
            <button
              key={subject.key}
              onClick={() => setSelectedSubject(subject.key)}
              className={`p-4 rounded-lg font-medium transition-all ${
                selectedSubject === subject.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <p className="text-sm">{subject.name}</p>
              <p className="text-xs mt-1 opacity-75">{subject.code}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Subject Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 border border-blue-200">
          <p className="text-blue-600 text-sm font-medium">Subject Name</p>
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
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-6 border border-orange-200">
          <p className="text-orange-600 text-sm font-medium">Duration</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{config.duration} min</p>
        </div>
      </div>

      {/* Sections Detail */}
      <div className="space-y-4">
        {config.sections.map((section) => {
          const totalSectionMarks = section.questions.reduce((sum, q) => sum + q.marks, 0);

          return (
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

                  {/* Questions Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-300">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Q No</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Marks</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">% of Total</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">% of Section</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {section.questions.map((question) => (
                          <tr key={question.qNo} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-bold text-gray-900">Q{question.qNo}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getQuestionTypeColor(
                                  question.type
                                )}`}
                              >
                                {getQuestionTypeLabel(question.type)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-gray-900">{question.marks}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-600">
                                {((question.marks / config.totalMarks) * 100).toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-600">
                                {((question.marks / section.totalMarks) * 100).toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
