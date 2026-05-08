import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Scripts from './pages/Scripts';
import ExaminerMarking from './pages/ExaminerMarking';
import SubjectConfig from './pages/SubjectConfig';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
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
    </Router>
  );
}

export default App;
