import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, FileText, BarChart3, Settings, Users, BookOpen, PenTool, Layers, School, Building2, Calendar, ClipboardList, Shield, UserCheck } from 'lucide-react';

const Sidebar = () => {
  const { userType } = useAuth();

  // Admin navigation
  const adminMenuItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <School size={20} />, label: 'Universities', path: '/admin/universities' },
    { icon: <Building2 size={20} />, label: 'Departments', path: '/admin/departments' },
    { icon: <BookOpen size={20} />, label: 'Subjects', path: '/admin/subjects' },
    { icon: <Calendar size={20} />, label: 'Sessions', path: '/admin/sessions' },
    { icon: <ClipboardList size={20} />, label: 'Projects', path: '/admin/projects' },
    { icon: <FileText size={20} />, label: 'Papers', path: '/admin/papers' },
    { icon: <Users size={20} />, label: 'Users', path: '/admin/users' },
    { icon: <Shield size={20} />, label: 'Role Management', path: '/admin/role-management' },
    { icon: <UserCheck size={20} />, label: 'Attendance', path: '/admin/attendance' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  // Coordinator navigation
  const coordinatorMenuItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/coordinator/dashboard' },
    { icon: <Building2 size={20} />, label: 'Departments', path: '/departments' },
    { icon: <BookOpen size={20} />, label: 'Subjects', path: '/subjects' },
    { icon: <Calendar size={20} />, label: 'Sessions', path: '/sessions' },
    { icon: <ClipboardList size={20} />, label: 'Projects', path: '/projects' },
    { icon: <FileText size={20} />, label: 'Papers', path: '/papers' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  // Examiner navigation
  const examinerMenuItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/' },
    { icon: <FileText size={20} />, label: 'Scripts', path: '/scripts' },
    { icon: <PenTool size={20} />, label: 'Marking', path: '/marking' },
    { icon: <Layers size={20} />, label: 'Subject Config', path: '/subject-config' },
    { icon: <BarChart3 size={20} />, label: 'Reports', path: '/reports' },
    { icon: <Users size={20} />, label: 'Examiners', path: '/examiners' },
    { icon: <BookOpen size={20} />, label: 'Subjects', path: '/subjects' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  // Select menu based on user type
  let menuItems = examinerMenuItems;
  if (userType === 'admin') {
    menuItems = adminMenuItems;
  } else if (userType === 'coordinator') {
    menuItems = coordinatorMenuItems;
  }

  return (
    <aside className="w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 sticky top-16 overflow-y-auto">
      <div className="p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
