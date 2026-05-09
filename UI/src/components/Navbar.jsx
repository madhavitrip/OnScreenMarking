import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Bell, BookOpen, Settings } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';
  const userType = localStorage.getItem('userType') || 'examiner';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <nav className="h-16 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 flex items-center justify-between px-6 sticky top-0 z-50 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
          <BookOpen className="text-blue-600" size={24} />
        </div>
        <div>
          <span className="font-bold text-xl text-white">OSM Portal</span>
          <p className="text-xs text-blue-100">On-Screen Marking System</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {userType === 'admin' && (
          <Link 
            to="/admin/dashboard"
            className="text-white hover:bg-blue-500 px-3 py-1 rounded transition-colors flex items-center gap-1"
          >
            <Settings size={18} />
            <span className="text-sm font-medium">Admin</span>
          </Link>
        )}
        <button className="p-2 text-white hover:bg-blue-500 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 border-l border-blue-400 pl-6">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
            <User size={20} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{userName}</p>
            <p className="text-xs text-blue-100 capitalize">{userType}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-white hover:bg-blue-500 px-3 py-1 rounded transition-colors ml-2"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
