import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function PapersManagement() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const subjectId = searchParams.get("subjectId");

  const [papers, setPapers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    paperCode: "",
    paperName: "",
    paperNumber: 1,
    maxMarks: 100,
    totalQuestions: 0,
    description: "",
    catchNo: "",
    subjectId: subjectId || "",
    projectId: projectId || "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "https://localhost:7243/api";

  useEffect(() => {
    fetchSubjects();
    fetchProjects();
    if (subjectId || projectId) {
      fetchPapers();
    }
  }, [subjectId, projectId]);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/subject`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/project`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      let url = `${API_URL}/papers`;
      const params = [];
      if (subjectId) params.push(`subjectId=${subjectId}`);
      if (projectId) params.push(`projectId=${projectId}`);
      if (params.length > 0) url += "?" + params.join("&");

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPapers(data);
      }
    } catch (err) {
      setError("Failed to fetch papers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.paperCode ||
      !formData.paperName ||
      !formData.subjectId ||
      !formData.projectId
    ) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_URL}/papers/${editingId}`
        : `${API_URL}/papers`;

      const payload = {
        ...formData,
        subjectId: parseInt(formData.subjectId, 10),
        projectId: parseInt(formData.projectId, 10),
        paperNumber: parseInt(formData.paperNumber, 10),
        maxMarks: parseFloat(formData.maxMarks),
        totalQuestions: parseInt(formData.totalQuestions, 10),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setFormData({
          paperCode: "",
          paperName: "",
          paperNumber: 1,
          maxMarks: 100,
          totalQuestions: 0,
          description: "",
          subjectId: subjectId || "",
          projectId: projectId || "",
          isActive: true,
        });
        setEditingId(null);
        setShowForm(false);
        setError("");
        fetchPapers();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to save paper");
      }
    } catch (err) {
      setError("Error saving paper");
      console.error(err);
    }
  };

  const handleEdit = (paper) => {
    setFormData({
      paperCode: paper.paperCode,
      paperName: paper.paperName,
      paperNumber: paper.paperNumber,
      maxMarks: paper.maxMarks,
      totalQuestions: paper.totalQuestions,
      description: paper.description,
      catchNo: paper.catchNo || "",
      subjectId: paper.subjectId,
      projectId: paper.projectId,
      isActive: paper.isActive,
    });
    setEditingId(paper.paperId);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({
      paperCode: "",
      paperName: "",
      paperNumber: 1,
      maxMarks: 100,
      totalQuestions: 0,
      description: "",
      catchNo: "",
      subjectId: subjectId || "",
      projectId: projectId || "",
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Papers</h1>
            <p className="text-slate-400">Manage exam papers</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            {showForm ? "Cancel" : "+ Add Paper"}
          </button>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-slate-700 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? "Edit Paper" : "Add New Paper"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Paper Code *
                  </label>
                  <input
                    type="text"
                    value={formData.paperCode}
                    onChange={(e) =>
                      setFormData({ ...formData, paperCode: e.target.value })
                    }
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., MATH-101"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Paper Name *
                  </label>
                  <input
                    type="text"
                    value={formData.paperName}
                    onChange={(e) =>
                      setFormData({ ...formData, paperName: e.target.value })
                    }
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Mathematics Paper 1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    CatchNo
                  </label>
                  <input
                    value={formData.catchNo}
                    onChange={(e) =>
                      setFormData({ ...formData, catchNo: e.target.value })
                    }
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Subject *
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) =>
                      setFormData({ ...formData, subjectId: e.target.value })
                    }
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.subjectId} value={subject.subjectId}>
                        {subject.subjectName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Project *
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) =>
                      setFormData({ ...formData, projectId: e.target.value })
                    }
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project.projectId} value={project.projectId}>
                        {project.projectName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Paper Number
                  </label>
                  <input
                    type="number"
                    value={formData.paperNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, paperNumber: e.target.value })
                    }
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    value={formData.maxMarks}
                    onChange={(e) =>
                      setFormData({ ...formData, maxMarks: e.target.value })
                    }
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Total Questions
                  </label>
                  <input
                    value={formData.totalQuestions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalQuestions: e.target.value,
                      })
                    }
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter paper description"
                  rows="3"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 rounded"
                />
                <label className="ml-2 text-slate-300">Active</label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  {editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Papers List */}
        <div className="bg-slate-700 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading...</div>
          ) : papers.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No papers found. Create one to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                      Max Marks
                    </th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                      Questions
                    </th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {papers.map((paper) => (
                    <tr
                      key={paper.paperId}
                      className="border-t border-slate-600 hover:bg-slate-600 transition"
                    >
                      <td className="px-6 py-4 text-white">
                        {paper.paperCode}
                      </td>
                      <td className="px-6 py-4 text-white">
                        {paper.paperName}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {paper.maxMarks}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {paper.totalQuestions}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            paper.isActive
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {paper.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEdit(paper)}
                          className="text-blue-400 hover:text-blue-300 mr-4 font-semibold"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
