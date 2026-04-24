import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Map, LayoutDashboard, LogIn, Moon, Sun, Menu, X, AlertTriangle, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_LABELS = {
  user: 'Citizen',
  admin: 'Admin',
  gov: 'Gov / Law',
  healthcare: 'Healthcare',
  ngo: 'NGO'
};

const ROLE_COLORS = {
  user: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  gov: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  healthcare: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
  ngo: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
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
    { name: 'Heatmap', path: '/map', icon: Map },
    { name: user?.role === 'user' ? 'My Dashboard' : 'Command Center', path: '/dashboard', icon: LayoutDashboard, requiresAuth: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}>
              <AlertCircle className="h-9 w-9 text-teal-600 group-hover:text-teal-500 transition-colors" />
            </motion.div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-teal-600 to-blue-600 text-transparent bg-clip-text">
                CareNet
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 tracking-widest uppercase font-medium hidden sm:block">
                Substance Risk Monitor
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.requiresAuth && !user) return null;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300'
                      : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50/50 dark:text-gray-300 dark:hover:bg-teal-900/10 dark:hover:text-teal-400'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Report CTA — desktop */}
            {user && (
              <Link
                to="/report"
                className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-teal-500/30 transition-all hover:-translate-y-0.5"
              >
                <AlertTriangle className="w-4 h-4" />
                Report
              </Link>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-amber-300 bg-gray-100 dark:bg-gray-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User info — desktop */}
            {user ? (
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 mt-0.5 rounded-full uppercase tracking-wider font-bold ${ROLE_COLORS[user.role] || ROLE_COLORS.user}`}>
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-900/30 px-3 py-2 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors pl-3 border-l border-gray-200 dark:border-gray-700"
              >
                <LogIn className="w-4 h-4" /> Login
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                if (link.requiresAuth && !user) return null;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive(link.path)
                        ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {link.name}
                  </Link>
                );
              })}

              {user && (
                <Link
                  to="/report"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" /> Report Incident
                </Link>
              )}

              <div className="border-t border-gray-100 dark:border-slate-700 pt-3 mt-3">
                {user ? (
                  <div className="flex items-center justify-between px-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${ROLE_COLORS[user.role] || ROLE_COLORS.user}`}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </div>
                    <button onClick={handleLogout} className="text-sm font-semibold text-red-500 hover:text-red-700 flex items-center gap-1">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    <LogIn className="w-4 h-4" /> Login / Sign Up
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
