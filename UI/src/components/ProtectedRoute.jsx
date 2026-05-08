import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Mock authentication state
  const isAuthenticated = localStorage.getItem('token') !== null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
