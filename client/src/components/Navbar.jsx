import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, Map, LayoutDashboard, LogIn, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: null, roles: ['all'] },
    { name: 'Heatmap', path: '/map', icon: <Map className="w-4 h-4 mr-1" />, roles: ['all'] },
    { 
      name: user?.role === 'user' ? 'My Dashboard' : 'Command Center', 
      path: '/dashboard', 
      icon: <LayoutDashboard className="w-4 h-4 mr-1" />, 
      roles: ['admin', 'gov', 'ngo', 'healthcare', 'user'] 
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg mx-auto border-b border-gray-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-24">
          
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle className="h-10 w-10 text-teal-600 group-hover:text-teal-500 transition-colors" />
              </motion.div>
              <span className="font-extrabold text-3xl tracking-tight bg-gradient-to-r from-teal-600 to-blue-600 text-transparent bg-clip-text">
                CareNet
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex sm:space-x-8 items-center">
            {navLinks.map((link) => {
              // Check role access
              if (link.roles[0] !== 'all') {
                if (!user || !link.roles.includes(user.role)) return null;
              }

              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`inline-flex items-center px-4 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300'
                      : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50/50 dark:text-gray-300 dark:hover:bg-teal-900/10 dark:hover:text-teal-400'
                  }`}
                >
                  {React.cloneElement(link.icon || <></>, { className: 'w-5 h-5 mr-2' })}
                  {link.name}
                </Link>
              );
            })}

            <Link
              to="/report"
              className="ml-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-bold rounded-full shadow-md text-white bg-teal-600 hover:bg-teal-700 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Report Incident
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-amber-300 bg-gray-100 dark:bg-gray-800 transition-colors shadow-inner"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            
            {user ? (
              <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                    {user.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 mt-1 rounded bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 uppercase tracking-widest font-bold">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-sm font-bold text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-900/30 px-4 py-2 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center text-base font-bold text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors pl-4 border-l border-gray-200 dark:border-gray-700"
              >
                <LogIn className="w-5 h-5 mr-2" /> Login
              </Link>
            )}
            
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
