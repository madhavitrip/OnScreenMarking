import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BreadcrumbProvider } from './context/BreadcrumbContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Scripts from './pages/Scripts';
import ExaminerMarking from './pages/ExaminerMarking';
import SubjectConfig from './pages/SubjectConfig';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import UniversityManagement from './pages/UniversityManagement';
import DepartmentManagement from './pages/DepartmentManagement';
import SubjectManagement from './pages/SubjectManagement';
import SessionProjectManagement from './pages/SessionProjectManagement';
import PapersManagement from './pages/PapersManagement';
import UsersManagement from './pages/UsersManagement';
import RoleManagement from './pages/RoleManagement';
import Attendance from './pages/Attendance';
import Register from './pages/Register';
import AcceptInvitation from './pages/AcceptInvitation';
import ScriptAllocation from './pages/ScriptAllocation';
import Profile from './pages/Profile';

function AppRoutes() {
  const { userType, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/accept-invitation" element={<AcceptInvitation />} />

      {/* Main App Layout */}
      <Route element={<Layout />}>
        {/* Dynamic Home Redirect */}
        <Route 
          path="/" 
          element={
            userType === 'admin' 
              ? <Navigate to="/admin/dashboard" replace /> 
              : userType === 'coordinator' 
              ? <Navigate to="/coordinator/dashboard" replace /> 
              : <Home />
          } 
        />

        {/* Dashboard Routes */}
        <Route 
          path="/admin/dashboard" 
          element={userType === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/coordinator/dashboard" 
          element={userType === 'coordinator' ? <CoordinatorDashboard /> : <Navigate to="/" replace />} 
        />

        {/* Dynamic Permission Guided Routes */}
        <Route 
          path="/admin/universities" 
          element={userType === 'admin' ? <UniversityManagement /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/admin/departments" 
          element={userType === 'admin' ? <DepartmentManagement /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/departments" 
          element={userType === 'coordinator' ? <DepartmentManagement /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/admin/subjects" 
          element={userType === 'admin' ? <SubjectManagement /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/subjects" 
          element={userType === 'coordinator' ? <SubjectManagement /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/admin/sessions" 
          element={userType === 'admin' ? <SessionProjectManagement /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/admin/projects" 
          element={userType === 'admin' ? <SessionProjectManagement /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/sessions" 
          element={userType === 'coordinator' ? <SessionProjectManagement /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/projects" 
          element={userType === 'coordinator' ? <SessionProjectManagement /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/admin/papers" 
          element={userType === 'admin' ? <PapersManagement /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/papers" 
          element={userType === 'coordinator' ? <PapersManagement /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/admin/subject-config" 
          element={userType === 'admin' ? <SubjectConfig /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/subject-config" 
          element={userType === 'examiner' ? <SubjectConfig /> : <Navigate to="/" replace />} 
        />

        {/* Dynamic Permissions Controlled Routes */}
        <Route 
          path="/admin/users" 
          element={hasPermission("READ_USER") ? <UsersManagement /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/admin/role-management" 
          element={hasPermission("READ_ROLE") ? <RoleManagement /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/admin/attendance" 
          element={hasPermission("VIEW_LOGS") ? <Attendance /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/admin/allocate-scripts" 
          element={hasPermission("READ_ALLOCATION") ? <ScriptAllocation /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/allocate-scripts" 
          element={hasPermission("READ_ALLOCATION") ? <ScriptAllocation /> : <Navigate to="/" replace />} 
        />

        {/* Examiner Routes */}
        <Route 
          path="/scripts" 
          element={hasPermission("READ_SCRIPT") ? <Scripts /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/marking" 
          element={hasPermission("READ_MARKING") ? <ExaminerMarking /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/reports" 
          element={hasPermission("VIEW_REPORTS") ? <Reports /> : <Navigate to="/" replace />} 
        />
        <Route path="/settings" element={<Settings />} />
      </Route>
      {/* University Coordinator Routes - Manage their university */}
      {userType === 'coordinator' && (
        <Route element={<Layout />}>
          <Route 
            path="/" 
            element={<Navigate to="/coordinator/dashboard" replace />} 
          />
          <Route 
            path="/coordinator/dashboard" 
            element={<CoordinatorDashboard />} 
          />
          <Route 
            path="/departments" 
            element={<DepartmentManagement />} 
          />
          <Route 
            path="/subjects" 
            element={<SubjectManagement />} 
          />
          <Route 
            path="/sessions" 
            element={<SessionProjectManagement />} 
          />
          <Route 
            path="/projects" 
            element={<SessionProjectManagement />} 
          />
          <Route 
            path="/papers" 
            element={<PapersManagement />} 
          />
          <Route 
            path="/allocate-scripts" 
            element={<ScriptAllocation />} 
          />
          <Route 
            path="/users" 
            element={<UsersManagement />} 
          />
        </Route>
      )}

      {/* Examiner Routes - View and mark scripts */}
      {userType === 'examiner' && (
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/scripts" element={<Scripts />} />
          <Route path="/marking" element={<ExaminerMarking />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      )}
      
      {/* Protected Routes with Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/scripts" element={<Scripts />} />
          <Route path="/marking" element={<ExaminerMarking />} />
          <Route path="/subject-config" element={<SubjectConfig />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/examiners" element={<Home />} />
          <Route path="/subjects" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <BreadcrumbProvider>
          <AppRoutes />
        </BreadcrumbProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
