import { createContext, useContext, useState, useEffect } from 'react';
import apiCall from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Failed to parse saved user:', e);
      return null;
    }
  });

  const [permissions, setPermissions] = useState(() => {
    const savedPermissions = localStorage.getItem('permissions');
    try {
      return savedPermissions ? JSON.parse(savedPermissions) : [];
    } catch (e) {
      return [];
    }
  });
  
  // Only show loading if we have a token but no user data yet
  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    return !!token && !savedUser;
  });
  
  const [error, setError] = useState(null);

  // Fetch user data from token on mount or refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
      setUser(null);
      setPermissions([]);
    }
  }, []);

  const fetchUserPermissions = async (userData) => {
    if (!userData || !userData.userType) return [];
    try {
      const response = await apiCall('/role');
      if (response && response.success && response.data) {
        const matchingRole = response.data.find(
          r => r.roleName.toLowerCase() === userData.userType.toLowerCase()
        );
        if (matchingRole) {
          const perms = matchingRole.permissionsList || [];
          setPermissions(perms);
          localStorage.setItem('permissions', JSON.stringify(perms));
          return perms;
        }
      }
    } catch (e) {
      console.error('Failed to fetch user permissions:', e);
    }
    return [];
  };

  const fetchUserData = async () => {
    try {
      // If we don't have a user, we must show loading
      if (!user) setLoading(true);
      
      const userData = await apiCall('/users/me');
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      await fetchUserPermissions(userData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      
      // Only logout if it's an authentication error (401/403)
      // If it's a network error (failed to fetch), keep the cached user
      if (err.message.includes('401') || err.message.includes('403') || err.message.includes('Unauthorized')) {
        setError('Session expired. Please login again.');
        logout();
      } else {
        setError('Could not refresh user data. Working with cached data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use /Auth/login to match authService.js casing if needed, 
      // but apiCall usually handles whatever the backend expects.
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Set user data
      setUser(response.user);
      await fetchUserPermissions(response.user);
      
      return response;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    // Clear other potential legacy items from authService.js
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('profileImage');
    localStorage.removeItem('universityId');
    localStorage.removeItem('subjectId1');
    
    setUser(null);
    setPermissions([]);
    setError(null);
  };

  const refreshUser = async () => {
    await fetchUserData();
  };

  const hasPermission = (permissionName) => {
    // Admin fallback
    if (user?.userType === 'admin') return true;

    // Coordinator fallback (grant default coordinator permissions)
    if (user?.userType === 'coordinator') {
      const coordinatorPerms = [
        "READ_SCRIPT", "READ_MARKING", "CREATE_MARKING", "UPDATE_MARKING", 
        "VIEW_REPORTS", "READ_ALLOCATION", "CREATE_ALLOCATION", "UPDATE_ALLOCATION", 
        "DELETE_ALLOCATION", "READ_USER", "READ_ROLE", "VIEW_LOGS"
      ];
      if (coordinatorPerms.includes(permissionName)) {
        return true;
      }
    }

    // Examiner fallback (grant default examiner permissions)
    if (user?.userType === 'examiner') {
      const examinerPerms = ["READ_SCRIPT", "READ_MARKING", "CREATE_MARKING", "UPDATE_MARKING", "VIEW_REPORTS", "READ_ALLOCATION"];
      if (examinerPerms.includes(permissionName)) {
        return true;
      }
    }

    if (permissions && permissions.length > 0) {
      return permissions.includes(permissionName);
    }
    return false;
  };

  const value = {
    user,
    permissions,
    hasPermission,
    loading,
    error,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    userType: user?.userType,
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
    profileImage: user?.profileImage,
    universityId: user?.universityId,
    subjectId1: user?.subjectId1
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
