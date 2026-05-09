import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Map, LayoutDashboard, LogIn, Moon, Sun, Menu, X, AlertTriangle, LogOut, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  user: 'Citizen',
  admin: 'Admin',
  gov: 'Gov / Law',
  healthcare: 'Healthcare',
  ngo: 'NGO'
};

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Map', path: '/map', icon: Map },
    { name: user?.role === 'user' ? 'Dashboard' : 'Command Center', path: '/dashboard', icon: LayoutDashboard, requiresAuth: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">CareNet</span>
            </Link>
            
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              {navLinks.map((link) => {
                if (link.requiresAuth && !user) return null;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                      isActive(link.path)
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                        : 'text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <Link
                to="/report"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors"
              >
                <AlertTriangle className="w-4 h-4" /> Report
              </Link>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="hidden md:flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200 dark:border-slate-700">
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-900 dark:text-white">{user.name}</div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">{ROLE_LABELS[user.role]}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors"
              >
                Login
              </Link>
            )}

            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              if (link.requiresAuth && !user) return null;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-semibold ${
                    isActive(link.path)
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            {user && (
              <Link
                to="/report"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-bold bg-indigo-600 text-white"
              >
                Report Incident
              </Link>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-semibold text-red-500"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-semibold text-gray-600 dark:text-gray-300"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
