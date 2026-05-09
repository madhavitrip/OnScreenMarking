import React, { useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoStream, setVideoStream] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'examiner',
    universityId: '',
    departmentId: '',
    phone: '',
    address: '',
    profileImage: ''
  });

  const API_URL = 'https://localhost:7243/api';

  useEffect(() => {
    fetchUsers();
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (formData.universityId) {
      fetchDepartments(formData.universityId);
    }
  }, [formData.universityId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/universities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUniversities(data);
      }
    } catch (err) {
      console.error('Failed to fetch universities:', err);
    }
  };

  const fetchDepartments = async (universityId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/department?universityId=${universityId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Failed to access camera');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      setFormData({ ...formData, profileImage: imageData });
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
      setShowCamera(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.profileImage) {
      setError('Please fill all required fields and capture a profile picture');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
        universityId: formData.universityId ? parseInt(formData.universityId, 10) : null,
        departmentId: formData.departmentId ? parseInt(formData.departmentId, 10) : null,
        phone: formData.phone,
        address: formData.address,
        profileImage: formData.profileImage
      };

      const response = await fetch(`${API_URL}/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setFormData({
          name: '',
          email: '',
          password: '',
          userType: 'examiner',
          universityId: '',
          departmentId: '',
          phone: '',
          address: '',
          profileImage: ''
        });
        setEditingId(null);
        setShowForm(false);
        setError('');
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create user');
      }
    } catch (err) {
      setError('Error creating user');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      userType: 'examiner',
      universityId: '',
      departmentId: '',
      phone: '',
      address: '',
      profileImage: ''
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
    stopCamera();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
            <p className="text-slate-400">Manage system users</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            {showForm ? 'Cancel' : '+ Add User'}
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
            <h2 className="text-xl font-bold text-white mb-4">Add New User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Camera Section */}
              <div className="bg-slate-600 rounded-lg p-4">
                <label className="block text-slate-300 font-semibold mb-2">
                  Profile Picture *
                </label>
                {showCamera ? (
                  <div className="space-y-3">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg bg-black"
                      style={{ maxHeight: '300px' }}
                    />
                    <canvas
                      ref={canvasRef}
                      style={{ display: 'none' }}
                      width="640"
                      height="480"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                      >
                        Capture Photo
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                      >
                        Cancel Camera
                      </button>
                    </div>
                  </div>
                ) : formData.profileImage ? (
                  <div className="space-y-3">
                    <img
                      src={formData.profileImage}
                      alt="Profile"
                      className="w-full rounded-lg"
                      style={{ maxHeight: '200px', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <Camera size={20} />
                      Retake Photo
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Camera size={20} />
                    Capture Photo
                  </button>
                )}
              </div>

              {/* User Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="user@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    User Type *
                  </label>
                  <select
                    value={formData.userType}
                    onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="examiner">Examiner</option>
                    <option value="coordinator">Coordinator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    University
                  </label>
                  <select
                    value={formData.universityId}
                    onChange={(e) => setFormData({ ...formData, universityId: e.target.value, departmentId: '' })}
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select University</option>
                    {universities.map((uni) => (
                      <option key={uni.universityId} value={uni.universityId}>
                        {uni.universityName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Department
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!formData.universityId}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.departmentId} value={dept.departmentId}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Address"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  Create User
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

        {/* Users List */}
        <div className="bg-slate-700 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No users found. Create one to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">Type</th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">University</th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-slate-600 hover:bg-slate-600 transition">
                      <td className="px-6 py-4 text-white">{user.name}</td>
                      <td className="px-6 py-4 text-slate-300">{user.email}</td>
                      <td className="px-6 py-4 text-slate-300 capitalize">{user.userType}</td>
                      <td className="px-6 py-4 text-slate-300">{user.university?.universityName || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          user.isActive
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
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
