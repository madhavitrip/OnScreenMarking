import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
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
import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";
import universityService from "../services/universityService";
import departmentService from "../services/departmentService";
import roleService from "../services/roleService";
import UniversityConfigHeader from "../components/UniversityConfigHeader";

export default function UsersManagement() {
  const [searchParams] = useSearchParams();
  const { userType, universityId: userUniversityId } = useAuth();
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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "",
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
  const [inviteUserType, setInviteUserType] = useState("examiner");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

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
    setGeneratedLink("");
    setEmailStatus(null);

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
        departmentId: inviteDeptId ? parseInt(inviteDeptId, 10) : null,
        userType: inviteUserType
      };

      const res = await userService.inviteUser(payload);

      if (res.success) {
        setInviteEmail("");
        setInviteDeptId("");
        setInviteUserType("examiner");

        const link = res.invitation?.invitationLink || res.invitation?.InvitationLink;
        if (link) {
          setGeneratedLink(link);
        }

        if (res.emailSent === false) {
          setEmailStatus({ sent: false, error: res.emailError || "SMTP Configuration Issue" });
          setError("Invitation generated, but the invitation email failed to send. Please copy and share the link below manually.");
        } else {
          setEmailStatus({ sent: true, error: null });
          setSuccess("Invitation email has been sent successfully!");
        }
        fetchUsers();
      }
    } catch (err) {
      setError(err.message || "Failed to send invitation.");
    } finally {
      setInviteLoading(false);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  // Filter pending examiners (inactive, type examiner)
  const pendingExaminers = users.filter((u) => u.isApproved == false && u.userType === "examiner");

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* University Sub-navigation Operations Hub */}
        <UniversityConfigHeader />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Users Management
            </h1>
            <p className="text-slate-500 mt-1">Manage system accounts, coordinate registration, and issue examiner invitations.</p>
          </div>
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
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === "all"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
          >
            <Users size={16} />
            All Users
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
            >
              {users.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("pending");
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === "pending"
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
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === "invite"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
          >
            <UserPlus size={16} />
            Invite User
          </button>
        </div>

        {/* Tab Content 1: All Users */}
        {activeTab === "all" && (
          <div className="space-y-6 animate-fade-in">
            {/* Direct Create User Form */}
            {/* List and search */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <h3 className="text-lg font-bold text-slate-900">User</h3>
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

              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-500 font-medium">Loading system users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-medium leading-relaxed">
                  <Users className="text-slate-400 mx-auto mb-3" size={32} />
                  <p className="text-lg text-slate-700 font-bold mb-1">No Users Found</p>
                  <p className="text-sm">There are no registered users matching your search or filters at the moment.</p>
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
                            <Link to={`/profile?userId=${user.id}`} title="View Detailed Profile">
                              {user.profileImage ? (
                                <div className="relative group w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover transition group-hover:scale-110" />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                    <Eye className="text-white" size={14} />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 hover:bg-slate-200 transition-colors">
                                  <Users size={16} className="text-slate-400" />
                                </div>
                              )}
                            </Link>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-900">{user.name}</td>
                          <td className="px-6 py-4 text-slate-600">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg capitalize border ${user.userType === "admin"
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
                              className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${user.isActive
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
                            <Link to={`/profile?userId=${user.id}`} title="View Detailed Profile">
                              {user.profileImage ? (
                                <div className="relative group w-12 h-12 rounded-xl overflow-hidden border border-slate-200">
                                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover transition group-hover:scale-110" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                    <Eye className="text-white" size={16} />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 hover:bg-slate-200 transition-colors">
                                  <Users size={20} className="text-slate-400" />
                                </div>
                              )}
                            </Link>
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
                {/* Role / User Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Assign System Role *</label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      value={inviteUserType}
                      onChange={(e) => setInviteUserType(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 outline-none transition appearance-none"
                    >
                      <option value="examiner">Examiner</option>
                      <option value="coordinator">University Coordinator</option>
                      {userType === "admin" && (
                        <option value="admin">Administrator</option>
                      )}
                    </select>
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
                      Sending Invitation...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Send Invitation Email
                    </>
                  )}
                </button>
              </form>

              {generatedLink && (
                <div className="mt-8 border-t border-slate-100 pt-6 animate-slide-up">
                  <div className={`p-4 rounded-xl border flex flex-col gap-3 ${emailStatus?.sent
                      ? "bg-emerald-50/50 border-emerald-100"
                      : "bg-amber-50/50 border-amber-100"
                    }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`text-sm font-bold ${emailStatus?.sent ? "text-emerald-800" : "text-amber-800"
                          }`}>
                          {emailStatus?.sent ? "✓ Invitation Generated & Dispatched" : "⚠ Invitation Generated (Email Failed)"}
                        </h4>
                        <p className={`text-xs mt-1 ${emailStatus?.sent ? "text-emerald-600" : "text-amber-600"
                          }`}>
                          {emailStatus?.sent
                            ? "An email was successfully sent, but you can also copy the direct link below as a backup:"
                            : `SMTP Delivery failed (${emailStatus?.error || "Credentials issue"}). Please copy the link below to share it manually via chat, WhatsApp, or another channel:`
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono select-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedLink);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                        className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition text-xs font-semibold ${copiedLink
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                          }`}
                      >
                        {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedLink ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
