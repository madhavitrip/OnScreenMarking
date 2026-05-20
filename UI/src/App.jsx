import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BreadcrumbProvider } from './context/BreadcrumbContext';
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
import Register from './pages/Register';
import AcceptInvitation from './pages/AcceptInvitation';

function App() {
  // Set default admin token for testing (remove in production)
  const setTestToken = () => {
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', 'test-token-for-development');
      localStorage.setItem('userType', 'admin');
      localStorage.setItem('userName', 'Admin User');
    }
  };

  // Get user type from localStorage
  const userType = localStorage.getItem('userType');
  const userId = localStorage.getItem('userId');

  return (
    <Router>
      <BreadcrumbProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/accept-invitation" element={<AcceptInvitation />} />
          
          {/* Admin Routes - Manage all universities */}
          {userType === 'admin' && (
            <Route element={<Layout />}>
              <Route 
                path="/" 
                element={<Navigate to="/admin/dashboard" replace />} 
              />
              <Route 
                path="/admin/dashboard" 
                element={<AdminDashboard />} 
              />
              <Route 
                path="/admin/universities" 
                element={<UniversityManagement />} 
              />
              <Route 
                path="/admin/departments" 
                element={<DepartmentManagement />} 
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
              <Route 
                path="/admin/subject-config" 
                element={<SubjectConfig />} 
              />
             
              <Route 
                path="/admin/users" 
                element={<UsersManagement />} 
              />
            </Route>
          )}

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
            </Route>
          </Route>

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BreadcrumbProvider>
    </Router>
  );
}

export default App;
