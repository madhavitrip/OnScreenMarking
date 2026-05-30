import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Breadcrumb from './Breadcrumb';
import ProjectCockpitSidebar from './ProjectCockpitSidebar';

const Layout = () => {
  const location = useLocation();
  const path = location.pathname;

  // Render the persistent right-side control panel if inside a selected project
  const selectedProjectId = localStorage.getItem('selectedProjectId');
  const isProjectPage = 
    path.includes('project-dashboard') || 
    path.includes('allocate-scripts') || 
    path.includes('papers') || 
    path.includes('subject-config');

  const showProjectSidebar = selectedProjectId && isProjectPage;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Left Workspace Area */}
        <main className="flex-1 p-6 overflow-x-hidden">
          <Breadcrumb />
          <Outlet />
        </main>
        
        {/* Persistent Right Control Panel */}
        {showProjectSidebar && <ProjectCockpitSidebar />}
      </div>
    </div>
  );
};

export default Layout;
