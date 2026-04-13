import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Briefcase,
  CalendarRange,
  PenLine,
  MessageSquare,
  GalleryVerticalEnd,
  ScrollText,
  LogOut,
  X,
  Sparkles,
  Receipt,
  Package,
  FileDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
    { id: 'events', label: 'Events Calendar', icon: CalendarRange, path: '/events' },
    { id: 'billing', label: 'Create Bill', icon: PenLine, path: '/billing' },
    { id: 'quotation', label: 'Create Quotation', icon: MessageSquare, path: '/quotation/create' },
    { id: 'view-quotations', label: 'View Quotations', icon: GalleryVerticalEnd, path: '/quotations' },
    { id: 'bills', label: 'View Bills', icon: ScrollText, path: '/bills' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, path: '/expenses' },
    { id: 'reports', label: 'Financial Reports', icon: FileDown, path: '/reports' },
    { id: 'products', label: 'Product Library', icon: Package, path: '/products' }
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
    <div className="w-64 h-full flex flex-col relative overflow-hidden bg-white border-r border-slate-100 shadow-xl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .glass-nav-active {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          box-shadow: 0 4px 15px -3px rgba(99, 102, 241, 0.4);
        }
      `}</style>

      {/* Dynamic Background Elements - Subtle for Light Mode */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-5%] right-[-10%] w-[200px] h-[200px] rounded-full bg-indigo-100/50 blur-[60px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[150px] h-[150px] rounded-full bg-purple-100/50 blur-[60px]" />
      </div>

      {/* Mobile Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 lg:hidden z-50 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Logo Section */}
      <div className="px-6 pt-8 pb-8 z-10">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="relative w-11 h-11">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl blur-sm opacity-60 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative w-11 h-11 bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold font-outfit text-slate-800 tracking-tight leading-none">
              Eventify
            </h1>
            <span className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold mt-1">
              Billing System
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto z-10 scrollbar-hide">
        <div className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-outfit">Main Menu</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`w-full group flex items-center space-x-3 px-3 py-3 md:px-4 md:py-3.5 rounded-xl transition-all duration-300 font-outfit relative overflow-hidden ${isActive
                ? 'glass-nav-active text-white shadow-lg scale-[1.02]'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <Icon
                size={18}
                className={`transition-all duration-300 md:w-5 md:h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500 group-hover:scale-110'
                  }`}
              />
              <span className={`text-sm md:text-base font-medium tracking-wide transition-all ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom User Section */}
      <div className="p-3 md:p-4 z-10 mt-auto">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-xl md:rounded-2xl p-3 md:p-4 group hover:border-indigo-200 transition-colors duration-300">
          <div
            onClick={() => handleNavigation('/profile')}
            className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-3 cursor-pointer hover:bg-slate-50 rounded-lg p-1 transition-colors"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-[2px] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-slate-700 font-bold font-outfit text-xs md:text-sm">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-bold text-slate-800 truncate font-outfit group-hover:text-indigo-600 transition-colors">
                {user?.company?.companyName || user?.companyId?.companyName || 'My Company'}
              </p>
              <p className="text-[10px] md:text-xs text-slate-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 md:py-2.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 text-[10px] md:text-xs font-bold uppercase tracking-wider"
          >
            <LogOut size={14} className="md:w-4 md:h-4 w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
