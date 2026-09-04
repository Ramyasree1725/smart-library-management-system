import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Clock, 
  Bookmark, 
  Sparkles, 
  Repeat, 
  Users, 
  BarChart3, 
  QrCode, 
  AlertCircle,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Book Catalog', path: '/catalog', icon: BookOpen },
    { name: 'My Loans & Due Dates', path: '/history', icon: Clock },
    { name: 'My Reservations', path: '/reservations', icon: Bookmark },
  ];

  const adminLinks = [
    { name: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Book Inventory', path: '/admin/books', icon: BookOpen },
    { name: 'Circulation Desk (QR)', path: '/admin/circulation', icon: Repeat },
    { name: 'Students Directory', path: '/admin/students', icon: Users },
    { name: 'Demand & Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="p-4 space-y-6">
          
          {/* Section Header */}
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isAdmin ? 'Librarian Workspace' : 'Student Portal'}
            </span>
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Navigation */}
          <nav className="space-y-1.5">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Card / System Status */}
        <div className="p-4 m-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-indigo-950/30 rounded-2xl border border-blue-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Recommendation Engine</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {isAdmin 
              ? "Predictive turnover calculation enabled for catalog optimization."
              : "Smart algorithms actively personalize catalog based on your borrowed subjects."
            }
          </p>
        </div>
      </aside>
    </>
  );
};
