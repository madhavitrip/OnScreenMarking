import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Camera,
  X,
  CheckCircle,
  Mail,
  UserCheck,
  UserPlus,
  Users,
  Copy,
  Check,
  Building,
  Phone,
  Eye,
  Info,
  AlertCircle,
  Loader,
  Search,
  Sparkles
} from "lucide-react";
import userService from "../services/userService";
import universityService from "../services/universityService";
import departmentService from "../services/departmentService";

export default function UsersManagement() {
  const [searchParams] = useSearchParams();
  const userType = localStorage.getItem("userType");
  const userUniversityId = localStorage.getItem("universityId");
  const universityIdFromUrl = searchParams.get("universityId");
  const activeUniversityId =
    userType === "coordinator" ? userUniversityId : universityIdFromUrl;

  const [activeTab, setActiveTab] = useState("all"); // "all", "pending", "invite"
  const [users, setUsers] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Direct User Add Form State
  const [showForm, setShowForm] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "examiner",
    universityId: "",
    departmentId: "",
    phone: "",
    address: "",
    profileImage: "",
  });

  // Invitation Form State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDeptId, setInviteDeptId] = useState("");
  const [inviteUniId, setInviteUniId] = useState(activeUniversityId || "");
  const [inviteLoading, setInviteLoading] = useState(false);
  
  // Simulated Email Sandbox State
  const [showSandbox, setShowSandbox] = useState(false);
  const [sandboxData, setSandboxData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Profile Image Zoom Modal State
  const [zoomUser, setZoomUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchUniversities();
  }, [activeUniversityId]);

  useEffect(() => {
    const uniId = formData.universityId || activeUniversityId || inviteUniId;
    if (uniId) {
      fetchDepartments(uniId);
    } else {
      setDepartments([]);
    }
  }, [formData.universityId, activeUniversityId, inviteUniId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers(activeUniversityId);
      setUsers(data);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const data = await universityService.getAllUniversities();
      setUniversities(data);
    } catch (err) {
      setError("Failed to fetch universities");
      console.error(err);
    }
  };

  const fetchDepartments = async (universityId) => {
    try {
      const data = await departmentService.getDepartmentsByUniversity(universityId);
      setDepartments(data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  // Approval handler
  const handleApprove = async (userId) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      await userService.approveUser(userId);
      setSuccess("Examiner approved and activated successfully!");
      fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to approve examiner.");
    } finally {
      setLoading(false);
    }
  };

  // Invitation handler
  const handleSendInvite = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const finalUniId = activeUniversityId || inviteUniId;
    if (!inviteEmail) {
      setError("Email address is required.");
      return;
    }
    if (!finalUniId) {
      setError("Please select a university.");
      return;
    }

    try {
      setInviteLoading(true);
      const payload = {
        email: inviteEmail.trim(),
        universityId: parseInt(finalUniId, 10),
        departmentId: inviteDeptId ? parseInt(inviteDeptId, 10) : null
      };

      const res = await userService.inviteUser(payload);
      
      if (res.success) {
        const uniObj = universities.find(u => u.universityId === parseInt(finalUniId, 10));
        const deptObj = departments.find(d => d.departmentId === parseInt(inviteDeptId, 10));
        
        setSandboxData({
          email: res.invitation.email,
          token: res.invitation.token,
          invitationLink: res.invitation.invitationLink,
          universityName: uniObj ? uniObj.universityName : "On-Screen Marking Portal",
          departmentName: deptObj ? deptObj.name : "General / All Departments"
        });

        setShowSandbox(true);
        setInviteEmail("");
        setInviteDeptId("");
        setSuccess("Invitation generated and logged successfully!");
        fetchUsers();
      }
    } catch (err) {
      setError(err.message || "Failed to generate invitation.");
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInvitationLink = () => {
    if (sandboxData && sandboxData.invitationLink) {
      navigator.clipboard.writeText(sandboxData.invitationLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Direct Create User Webcam helpers
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Failed to access camera");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      const imageData = canvasRef.current.toDataURL("image/jpeg");
      setFormData({ ...formData, profileImage: imageData });
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
      setShowCamera(false);
    }
  };

  const handleSubmitDirectUser = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.profileImage
    ) {
      setError("Please fill all required fields and capture a profile picture");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
        universityId:
          formData.universityId || activeUniversityId
            ? parseInt(formData.universityId || activeUniversityId, 10)
            : null,
        departmentId: formData.departmentId
          ? parseInt(formData.departmentId, 10)
          : null,
        phone: formData.phone,
        address: formData.address,
        profileImage: formData.profileImage,
      };

      await userService.createUser(payload);
      setSuccess("User created successfully");
      setFormData({
        name: "",
        email: "",
        password: "",
        userType: "examiner",
        universityId: "",
        departmentId: "",
        phone: "",
        address: "",
        profileImage: "",
      });
      setShowForm(false);
      setError("");
      fetchUsers();
    } catch (err) {
      setError(err.message || "Error creating user");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDirectUser = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      userType: "examiner",
      universityId: "",
      departmentId: "",
      phone: "",
      address: "",
      profileImage: "",
    });
    setShowForm(false);
    setError("");
    stopCamera();
  };

  // Filter users based on search
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  // Filter pending examiners (inactive, type examiner)
  const pendingExaminers = users.filter((u) => !u.isActive && u.userType === "examiner");

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Users Management
            </h1>
            <p className="text-slate-500 mt-1">Manage system accounts, coordinate registration, and issue examiner invitations.</p>
          </div>
          {activeTab === "all" && (
            <button
              onClick={() => {
                setError("");
                setSuccess("");
                setShowForm(!showForm);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md flex items-center gap-2"
            >
              {showForm ? <X size={18} /> : <UserPlus size={18} />}
              {showForm ? "Cancel" : "Add Direct User"}
            </button>
          )}
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-3 shadow-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-3 shadow-sm animate-fade-in">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Tab Controls */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => {
              setActiveTab("all");
              setShowForm(false);
              stopCamera();
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all text-sm ${
              activeTab === "all"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Users size={16} />
            All Users
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {users.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("pending");
              setShowForm(false);
              stopCamera();
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all text-sm ${
              activeTab === "pending"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <UserCheck size={16} />
            Pending Approvals
            {pendingExaminers.length > 0 && (
              <span className="animate-pulse bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingExaminers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("invite");
              setShowForm(false);
              stopCamera();
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all text-sm ${
              activeTab === "invite"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <UserPlus size={16} />
            Invite Examiner
          </button>
        </div>

        {/* Tab Content 1: All Users */}
        {activeTab === "all" && (
          <div className="space-y-6 animate-fade-in">
            {/* Direct Create User Form */}
            {showForm && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 md:p-8 animate-slide-down">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-extrabold text-slate-900">Add New General User</h2>
                  <button onClick={handleCancelDirectUser} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmitDirectUser} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="e.g. Dr. Sarah Jenkins"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="sarah.j@university.edu"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Password *</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">User Type *</label>
                      <select
                        value={formData.userType}
                        onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none"
                        required
                      >
                        <option value="examiner">Examiner</option>
                        <option value="coordinator">Coordinator</option>
                        {userType === "admin" && <option value="admin">Admin</option>}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">University</label>
                      <select
                        value={formData.universityId || activeUniversityId || ""}
                        disabled={!!activeUniversityId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            universityId: e.target.value,
                            departmentId: "",
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed appearance-none"
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
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                      <select
                        value={formData.departmentId}
                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none disabled:bg-slate-50"
                        disabled={!(formData.universityId || activeUniversityId)}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Address location"
                      />
                    </div>
                  </div>

                  {/* Profile Image Capture inside form */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                    <label className="block text-sm font-bold text-slate-800 mb-3">Profile verification image *</label>
                    {showCamera ? (
                      <div className="space-y-4">
                        <div className="relative rounded-xl overflow-hidden bg-black shadow-inner border border-slate-300" style={{ maxHeight: "300px" }}>
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" style={{ minHeight: "240px" }} />
                          <canvas ref={canvasRef} style={{ display: "none" }} width="640" height="480" />
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-semibold transition shadow-md flex items-center justify-center gap-2 text-sm"
                          >
                            Capture Photo
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2.5 rounded-xl font-semibold transition text-sm"
                          >
                            Cancel Camera
                          </button>
                        </div>
                      </div>
                    ) : formData.profileImage ? (
                      <div className="space-y-4">
                        <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-md max-w-sm mx-auto">
                          <img src={formData.profileImage} alt="Profile preview" className="w-full object-cover rounded-xl" style={{ maxHeight: "200px" }} />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, profileImage: "" })}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-lg transition"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm"
                        >
                          <Camera size={16} />
                          Retake Verification Photo
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 shadow-md text-sm"
                      >
                        <Camera size={18} />
                        Capture Verification Picture
                      </button>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition shadow-md disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? "Creating..." : "Save User"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelDirectUser}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List and search */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <h3 className="text-lg font-bold text-slate-900">User Roster</h3>
                <div className="relative max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 pl-10 pr-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {loading && !showForm ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-500 font-medium">Fetching roster...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <Info className="text-slate-400 mx-auto mb-3" size={32} />
                  <p className="text-slate-600 text-lg mb-4">No users match your criteria.</p>
                  {!showForm && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
                    >
                      Add First User
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Photo</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">University</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            {user.profileImage ? (
                              <div className="relative group cursor-zoom-in w-10 h-10 rounded-full overflow-hidden border border-slate-200" onClick={() => setZoomUser(user)}>
                                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover transition group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                  <Eye className="text-white" size={14} />
                                </div>
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                <Users size={16} className="text-slate-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-900">{user.name}</td>
                          <td className="px-6 py-4 text-slate-600">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg capitalize border ${
                              user.userType === "admin" 
                                ? "bg-purple-50 text-purple-700 border-purple-200" 
                                : user.userType === "coordinator" 
                                ? "bg-amber-50 text-amber-700 border-amber-200" 
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}>
                              {user.userType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm">
                            {user.university?.universityName || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${
                                user.isActive
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-600 animate-pulse" : "bg-red-500"}`}></span>
                              {user.isActive ? "Active" : "Pending / Inactive"}
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
        )}

        {/* Tab Content 2: Pending Approvals */}
        {activeTab === "pending" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Awaiting University Coordinator Approval</h3>
                <p className="text-slate-500 text-xs mt-1">Review applicant profiles, verification pictures, and validate registrations.</p>
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-500 font-medium">Loading requests...</p>
                </div>
              ) : pendingExaminers.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-medium leading-relaxed">
                  <CheckCircle className="text-green-500 mx-auto mb-3" size={32} />
                  <p className="text-lg text-slate-700 font-bold mb-1">All Caught Up!</p>
                  <p className="text-sm">There are no pending examiner approvals for this university at the moment.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Photo</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingExaminers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            {user.profileImage ? (
                              <div className="relative group cursor-zoom-in w-12 h-12 rounded-xl overflow-hidden border border-slate-200" onClick={() => setZoomUser(user)}>
                                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover transition group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                  <Eye className="text-white" size={16} />
                                </div>
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                                <Users size={20} className="text-slate-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">{user.name}</td>
                          <td className="px-6 py-4 text-slate-600 text-sm font-medium">{user.email}</td>
                          <td className="px-6 py-4 text-slate-600 text-sm">
                            {user.department?.name || "-"}
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm">
                            {user.phone || "-"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleApprove(user.id)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm inline-flex items-center gap-1.5"
                            >
                              <UserCheck size={14} />
                              Approve Examiner
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
        )}

        {/* Tab Content 3: Invite Examiner */}
        {activeTab === "invite" && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Mail size={24} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-950">Issue Examiner Invitation</h3>
                <p className="text-sm text-slate-500 mt-1">Generate a secure unique token and onboarding link for pre-authorized examiners.</p>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-6">
                {/* Email Address */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Examiner Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="examiner.name@cbse.gov.in"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 outline-none transition"
                    />
                  </div>
                </div>

                {/* University Selection (Only shown for Admin, locked for Coordinator) */}
                {userType === "admin" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Assign University *</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select
                        required
                        value={inviteUniId}
                        onChange={(e) => {
                          setInviteUniId(e.target.value);
                          setInviteDeptId("");
                        }}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 outline-none transition appearance-none"
                      >
                        <option value="">Select University</option>
                        {universities.map((uni) => (
                          <option key={uni.universityId} value={uni.universityId}>
                            {uni.universityName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Department Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Assign Department</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      value={inviteDeptId}
                      onChange={(e) => setInviteDeptId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 outline-none transition appearance-none disabled:bg-slate-50"
                      disabled={!(activeUniversityId || inviteUniId)}
                    >
                      <option value="">Select Department (Optional)</option>
                      {departments.map((dept) => (
                        <option key={dept.departmentId} value={dept.departmentId}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                  <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
                  <div className="text-xs text-slate-600 leading-relaxed font-medium">
                    <p className="font-bold text-slate-800 mb-1">Demonstration Mode Enabled:</p>
                    Since standard mail servers are bypassed in development, this dashboard will capture the unique activation token and display the active link in a simulated sandbox immediately so you can copy and verify the examiner flow seamlessly!
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {inviteLoading ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      Generating Invitation...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate & Send Invitation
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Simulated Email Sandbox Modal */}
      {showSandbox && sandboxData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 text-slate-100 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-800 animate-slide-up flex flex-col" style={{ maxHeight: "90vh" }}>
            {/* Sandbox Titlebar */}
            <div className="bg-slate-950 px-6 py-4 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-sm font-extrabold text-amber-500 tracking-wider uppercase">Simulated Email Server Sandbox</span>
              </div>
              <button
                onClick={() => setShowSandbox(false)}
                className="text-slate-400 hover:text-slate-100 transition p-1 hover:bg-white/10 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Simulated Email Envelope details */}
            <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 text-xs text-slate-300 space-y-2 font-mono">
              <div>
                <span className="text-slate-500">From:</span> On-Screen Marking System &lt;noreply@osm-portal.gov.in&gt;
              </div>
              <div>
                <span className="text-slate-500">To:</span> {sandboxData.email}
              </div>
              <div>
                <span className="text-slate-500">Subject:</span> 🔐 Invitation to join On-Screen Marking Portal as Examiner
              </div>
              <div>
                <span className="text-slate-500">Timestamp:</span> {new Date().toLocaleString()}
              </div>
            </div>

            {/* Email Body Card */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-900 text-slate-800">
              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 md:p-8 max-w-xl mx-auto space-y-6 text-left">
                {/* Brand header */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold shadow-sm">
                    OSM
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">On-Screen Marking Portal</h4>
                    <p className="text-xs text-slate-500">Secure Digital Evaluation</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-900">Dear Examiner,</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    You have been pre-registered and invited by the university coordinator of <strong>{sandboxData.universityName}</strong> to join the digital assessment team as an Examiner.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                    Associated Department: {sandboxData.departmentName}
                  </p>
                  
                  <div className="py-4 text-center">
                    <a
                      href={sandboxData.invitationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
                    >
                      Set Password & Activate Account
                    </a>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 font-mono text-[11px] text-slate-500 break-all select-all">
                    <p className="font-bold text-slate-700 mb-1">Raw Activation Link:</p>
                    {sandboxData.invitationLink}
                  </div>

                  <p className="text-xs text-slate-400">
                    * This invitation link is unique to your credentials and will expire in 7 days.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 text-xs text-slate-400 text-center">
                  On-Screen Marking Board • Secure System Infrastructure
                </div>
              </div>
            </div>

            {/* Sandbox footer actions */}
            <div className="bg-slate-950 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-800">
              <p className="text-xs text-slate-400 text-center sm:text-left">
                Use the button to copy the link and open it in an Incognito / Private Tab to test the Examiner's activation flow.
              </p>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={copyInvitationLink}
                  className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition shadow flex items-center justify-center gap-2"
                >
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  {copiedLink ? "Link Copied!" : "Copy Activation Link"}
                </button>
                <button
                  onClick={() => setShowSandbox(false)}
                  className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold px-4 py-2 rounded-xl transition"
                >
                  Close Sandbox
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Photo Zoom Modal */}
      {zoomUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setZoomUser(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-square bg-slate-950">
              <img src={zoomUser.profileImage} alt={zoomUser.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setZoomUser(null)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 shadow-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <h4 className="text-lg font-bold text-slate-900">{zoomUser.name}</h4>
              <p className="text-slate-600 text-sm font-medium mt-1">{zoomUser.email}</p>
              
              <div className="border-t border-slate-100 mt-4 pt-4 space-y-2.5">
                <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
                  <Building size={14} className="text-slate-400" />
                  <span>{zoomUser.university?.universityName || "No University"}</span>
                </div>
                {zoomUser.department && (
                  <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
                    <Building size={14} className="text-slate-400" />
                    <span>Department of {zoomUser.department.name}</span>
                  </div>
                )}
                {zoomUser.phone && (
                  <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
                    <Phone size={14} className="text-slate-400" />
                    <span>{zoomUser.phone}</span>
                  </div>
                )}
              </div>

              {!zoomUser.isActive && zoomUser.userType === "examiner" && (
                <button
                  onClick={() => {
                    handleApprove(zoomUser.id);
                    setZoomUser(null);
                  }}
                  className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold transition shadow-sm text-sm flex items-center justify-center gap-2"
                >
                  <UserCheck size={16} />
                  Approve Examiner Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
