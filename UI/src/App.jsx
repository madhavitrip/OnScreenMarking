import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { BreadcrumbProvider } from './context/BreadcrumbContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AcceptInvitation from './pages/AcceptInvitation';

import Scripts from './pages/Scripts';
import ExaminerMarking from './pages/ExaminerMarking';
import SubjectConfig from './pages/SubjectConfig';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

import AdminDashboard from './pages/AdminDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';

import UniversityManagement from './pages/UniversityManagement';
import CollegeManagement from './pages/CollegeManagement';
import DepartmentManagement from './pages/DepartmentManagement';
import CourseManagement from './pages/CourseManagement';
import SubjectManagement from './pages/SubjectManagement';
import SessionProjectManagement from './pages/SessionProjectManagement';
import PapersManagement from './pages/PapersManagement';
import UsersManagement from './pages/UsersManagement';
import RoleManagement from './pages/RoleManagement';
import Attendance from './pages/Attendance';
import ScriptAllocation from './pages/ScriptAllocation';

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

  const getHomeRoute = () => {
    switch (userType) {
      case 'admin':
        return '/admin/dashboard';

      case 'coordinator':
        return '/coordinator/dashboard';

      default:
        return '/home';
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/accept-invitation" element={<AcceptInvitation />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Root Redirect */}
          <Route
            path="/"
            element={<Navigate to={getHomeRoute()} replace />}
          />

          {/* Common Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />

          {/* ================= ADMIN ================= */}
          {userType === 'admin' && (
            <>
              <Route
                path="/admin/dashboard"
                element={<AdminDashboard />}
              />

              <Route
                path="/admin/universities"
                element={<UniversityManagement />}
              />

              <Route
                path="/admin/colleges"
                element={<CollegeManagement />}
              />

              <Route
                path="/admin/departments"
                element={<DepartmentManagement />}
              />

              <Route
                path="/admin/courses"
                element={<CourseManagement />}
              />

              <Route
                path="/admin/subjects"
                element={<SubjectManagement />}
              />

              <Route
                path="/admin/sessions"
                element={<SessionProjectManagement />}
              />

              <Route
                path="/admin/projects"
                element={<SessionProjectManagement />}
              />

              <Route
                path="/admin/papers"
                element={<PapersManagement />}
              />

              {hasPermission('READ_USER') && (
                <Route
                  path="/admin/users"
                  element={<UsersManagement />}
                />
              )}

              {hasPermission('READ_ROLE') && (
                <Route
                  path="/admin/role-management"
                  element={<RoleManagement />}
                />
              )}

              {hasPermission('VIEW_LOGS') && (
                <Route
                  path="/admin/attendance"
                  element={<Attendance />}
                />
              )}

              {hasPermission('READ_ALLOCATION') && (
                <Route
                  path="/admin/allocate-scripts"
                  element={<ScriptAllocation />}
                />
              )}
            </>
          )}

          {/* ================= COORDINATOR ================= */}
          {userType === 'coordinator' && (
            <>
              <Route
                path="/coordinator/dashboard"
                element={<CoordinatorDashboard />}
              />

              <Route
                path="/departments"
                element={<DepartmentManagement />}
              />

              <Route
                path="/courses"
                element={<CourseManagement />}
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

              {hasPermission('READ_ALLOCATION') && (
                <Route
                  path="/allocate-scripts"
                  element={<ScriptAllocation />}
                />
              )}

              {hasPermission('READ_USER') && (
                <Route
                  path="/users"
                  element={<UsersManagement />}
                />
              )}
            </>
          )}

          {/* ================= EXAMINER ================= */}
          {userType === 'examiner' && (
            <>
              {hasPermission('READ_SCRIPT') && (
                <Route
                  path="/scripts"
                  element={<Scripts />}
                />
              )}

              {hasPermission('READ_MARKING') && (
                <Route
                  path="/marking"
                  element={<ExaminerMarking />}
                />
              )}

              {hasPermission('VIEW_REPORTS') && (
                <Route
                  path="/reports"
                  element={<Reports />}
                />
              )}

              <Route
                path="/subject-config"
                element={<SubjectConfig />}
              />
            </>
          )}

          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
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

