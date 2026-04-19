import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, Map, LayoutDashboard, LogIn, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: null },
    { name: 'Heatmap', path: '/map', icon: <Map className="w-4 h-4 mr-1" /> },
    { name: 'Admin', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4 mr-1" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 glass glass-neon mx-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle className="h-8 w-8 text-indigo-500 group-hover:text-indigo-400 transition-colors" />
              </motion.div>
              <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
                CHRAIS
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden sm:flex sm:space-x-4 items-center">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 dark:text-gray-300 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}

            <Link
              to="/report"
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all duration-300"
            >
              Report Incident
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-amber-300 bg-gray-100 dark:bg-gray-800 transition-colors shadow-inner"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link
              to="/login"
              className="hidden sm:flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              <LogIn className="w-4 h-4 mr-1" /> Login
            </Link>
            
            {/* Mobile Menu Button (simplified for now) */}
            <button className="sm:hidden p-2 text-gray-600 dark:text-gray-300">
              <Menu className="w-6 h-6" />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
