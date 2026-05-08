import { NavLink } from 'react-router-dom';
import { Home, FileText, BarChart3, Settings, Users, BookOpen, PenTool, Layers } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/' },
    { icon: <FileText size={20} />, label: 'Scripts', path: '/scripts' },
    { icon: <PenTool size={20} />, label: 'Marking', path: '/marking' },
    { icon: <Layers size={20} />, label: 'Subject Config', path: '/subject-config' },
    { icon: <BarChart3 size={20} />, label: 'Reports', path: '/reports' },
    { icon: <Users size={20} />, label: 'Examiners', path: '/examiners' },
    { icon: <BookOpen size={20} />, label: 'Subjects', path: '/subjects' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

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
