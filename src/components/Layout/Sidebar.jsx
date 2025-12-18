import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, Building2, LogOut, Receipt, Calendar, X, Sparkles, FilePlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'profile', label: 'Company Profile', icon: Building2, path: '/profile' },
    { id: 'events', label: 'Events Calendar', icon: Calendar, path: '/events' },
    { id: 'billing', label: 'Create Bill', icon: FileText, path: '/billing' },
    { id: 'quotation', label: 'Create Quotation', icon: FilePlus, path: '/quotation/create' },
    { id: 'bills', label: 'View Bills', icon: Receipt, path: '/bills' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <div className="w-64 bg-indigo-900 text-white h-full p-6 flex flex-col relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@600;700&display=swap');
        .font-heading { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      {/* Mobile Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-indigo-200 hover:text-white md:hidden"
      >
        <X size={24} />
      </button>

      <div className="mb-8 mt-2 md:mt-0">
        <div className="flex items-center space-x-3 mb-1">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg blur opacity-50"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-xl font-bold font-heading tracking-tight">Eventify</h1>
        </div>
        <div className="ml-13 text-indigo-200 text-sm font-medium truncate max-w-[10rem] opacity-90">
          {user?.company?.companyName}
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${isActive
                ? 'bg-indigo-600 text-white'
                : 'text-indigo-200 hover:bg-indigo-800'
                }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-indigo-200 hover:bg-indigo-800 transition duration-200 mt-4"
      >
        <LogOut size={20} />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
