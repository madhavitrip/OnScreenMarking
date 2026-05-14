import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BreadcrumbContext = createContext();

// Map routes to breadcrumb labels
const routeLabels = {
  '/admin/dashboard': { label: 'Dashboard', icon: 'LayoutDashboard' },
  '/admin/universities': { label: 'Universities', icon: 'Building2' },
  '/admin/departments': { label: 'Departments', icon: 'Briefcase' },
  '/admin/subjects': { label: 'Subjects', icon: 'BookOpen' },
  '/admin/sessions': { label: 'Sessions & Projects', icon: 'Calendar' },
  '/admin/papers': { label: 'Papers', icon: 'FileText' },
  '/admin/subject-config': { label: 'Subject Configuration', icon: 'Layers' },
  '/admin/users': { label: 'Users', icon: 'Users' },
  '/coordinator/dashboard': { label: 'Dashboard', icon: 'LayoutDashboard' },
};

export function BreadcrumbProvider({ children }) {
  const [breadcrumbs, setBreadcrumbs] = useState([
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' }
  ]);
  const [navigationHistory, setNavigationHistory] = useState(['/admin/dashboard']);
  const location = useLocation();

  // Track navigation history and build breadcrumbs
  useEffect(() => {
    const path = location.pathname;
    const queryParams = new URLSearchParams(location.search);
    
    // Build breadcrumbs based on navigation history
    const newBreadcrumbs = [];
    
    // Always start with dashboard
    newBreadcrumbs.push({
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: 'LayoutDashboard'
    });

    // Add Sessions & Projects if we're navigating from there
    if (navigationHistory.includes('/admin/sessions') && path !== '/admin/sessions') {
      newBreadcrumbs.push({
        label: 'Sessions & Projects',
        path: '/admin/sessions',
        icon: 'Calendar'
      });
    }

    // Add current route if it's not dashboard
    if (path !== '/admin/dashboard' && path !== '/coordinator/dashboard') {
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
  }, [location]);

  const setBreadcrumb = (items) => {
    // Always start with dashboard
    const dashboardItem = { label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' };
    setBreadcrumbs([dashboardItem, ...items]);
  };

  const addBreadcrumb = (item) => {
    setBreadcrumbs((prev) => [...prev, item]);
  };

  const clearBreadcrumbs = () => {
    setBreadcrumbs([
      { label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' }
    ]);
    setNavigationHistory(['/admin/dashboard']);
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
