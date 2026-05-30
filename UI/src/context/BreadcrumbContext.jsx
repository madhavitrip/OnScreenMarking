import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const BreadcrumbContext = createContext();

// Map routes to breadcrumb labels dynamically
const routeLabels = {
  // Admin paths
  '/admin/dashboard': { label: 'Dashboard', icon: 'LayoutDashboard' },
  '/admin/universities': { label: 'Universities', icon: 'Building2' },
  '/admin/masters': { label: 'Masters', icon: 'Briefcase' },
  '/admin/subjects': { label: 'Subjects', icon: 'BookOpen' },
  '/admin/sessions': { label: 'Sessions & Projects', icon: 'Calendar' },
  '/admin/projects': { label: 'Sessions & Projects', icon: 'Calendar' },
  '/admin/papers': { label: 'Paper Management', icon: 'FileText' },
  '/admin/subject-config': { label: 'Subject Configuration', icon: 'Layers' },
  '/admin/users': { label: 'Users', icon: 'Users' },
  '/admin/role-management': { label: 'Roles & Permissions', icon: 'Shield' },
  '/admin/attendance': { label: 'Attendance', icon: 'Users' },
  '/admin/allocate-scripts': { label: 'Script Allocation', icon: 'Layers' },

  // Coordinator paths
  '/coordinator/dashboard': { label: 'Dashboard', icon: 'LayoutDashboard' },
  '/masters': { label: 'Masters', icon: 'Briefcase' },
  '/subjects': { label: 'Subjects', icon: 'BookOpen' },
  '/sessions': { label: 'Sessions & Projects', icon: 'Calendar' },
  '/projects': { label: 'Sessions & Projects', icon: 'Calendar' },
  '/papers': { label: 'Paper Management', icon: 'FileText' },
  '/allocate-scripts': { label: 'Script Allocation', icon: 'Layers' },
  '/subject-config': { label: 'Subject Configuration', icon: 'Layers' },

  // Examiner paths
  '/': { label: 'Dashboard', icon: 'LayoutDashboard' },
  '/scripts': { label: 'My Allocated Scripts', icon: 'FileText' },
  '/marking': { label: 'Script Marking', icon: 'Layers' },
  '/reports': { label: 'Reports', icon: 'Briefcase' },
  '/settings': { label: 'Settings', icon: 'Briefcase' }
};

export function BreadcrumbProvider({ children }) {
  const { userType } = useAuth();
  const location = useLocation();

  const getDashboardPath = () => {
    if (userType === 'admin') return '/admin/dashboard';
    if (userType === 'coordinator') return '/coordinator/dashboard';
    return '/'; // Examiner / Default
  };

  const dashboardPath = getDashboardPath();

  const [breadcrumbs, setBreadcrumbs] = useState([
    { label: 'Dashboard', path: dashboardPath, icon: 'LayoutDashboard' }
  ]);
  const [navigationHistory, setNavigationHistory] = useState([dashboardPath]);

  // Track navigation history and build breadcrumbs
  useEffect(() => {
    const path = location.pathname;
    const queryParams = new URLSearchParams(location.search);
    const activeDashboard = getDashboardPath();
    
    // Build breadcrumbs based on navigation history
    const newBreadcrumbs = [];
    
    // Always start with dashboard
    newBreadcrumbs.push({
      label: 'Dashboard',
      path: activeDashboard,
      icon: 'LayoutDashboard'
    });

    // Add Sessions & Projects if we're navigating from there or on a config page
    const sessionPath = userType === 'admin' ? '/admin/sessions' : '/sessions';
    const isProjectOrSessionPath = (p) => {
      return p === '/admin/sessions' || p === '/admin/projects' || p === '/sessions' || p === '/projects';
    };
    
    const hasVisitedSession = navigationHistory.some(isProjectOrSessionPath);
    const isCurrentlySession = isProjectOrSessionPath(path);
    const isConfig = path.includes('subject-config');
    const isMainPage = path.includes('papers') || path.includes('allocate-scripts') || path.includes('users') || path.includes('project-dashboard');

    if ((hasVisitedSession || isConfig) && !isCurrentlySession && !isMainPage) {
      newBreadcrumbs.push({
        label: 'Sessions & Projects',
        path: sessionPath,
        icon: 'Calendar'
      });
    }

    // Add current route if it's not dashboard
    if (path !== '/admin/dashboard' && path !== '/coordinator/dashboard' && path !== '/') {
      const routeInfo = routeLabels[path];
      if (routeInfo) {
        newBreadcrumbs.push({
          label: routeInfo.label,
          path: path,
          icon: routeInfo.icon,
          queryParams: Object.fromEntries(queryParams)
        });
      }
    }

    setBreadcrumbs(newBreadcrumbs);

    // Update navigation history
    setNavigationHistory((prev) => {
      // Don't add duplicate consecutive paths
      if (prev[prev.length - 1] !== path) {
        return [...prev, path];
      }
      return prev;
    });
  }, [location, userType]);

  const setBreadcrumb = (items) => {
    const activeDashboard = getDashboardPath();
    const dashboardItem = { label: 'Dashboard', path: activeDashboard, icon: 'LayoutDashboard' };
    setBreadcrumbs([dashboardItem, ...items]);
  };

  const addBreadcrumb = (item) => {
    setBreadcrumbs((prev) => [...prev, item]);
  };

  const clearBreadcrumbs = () => {
    const activeDashboard = getDashboardPath();
    setBreadcrumbs([
      { label: 'Dashboard', path: activeDashboard, icon: 'LayoutDashboard' }
    ]);
    setNavigationHistory([activeDashboard]);
  };

  const resetBreadcrumbs = () => {
    clearBreadcrumbs();
  };

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumb, addBreadcrumb, clearBreadcrumbs, resetBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumb must be used within BreadcrumbProvider');
  }
  return context;
}
