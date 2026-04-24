import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Shows a spinner while auth state is loading
const Spinner = () => (
  <div className="h-screen flex items-center justify-center bg-white dark:bg-slate-900">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-teal-500"></div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Verifying session...</p>
    </div>
  </div>
);

// Protects any route — redirects to /login if not authenticated
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

// Protects routes for authority roles (admin, gov, ngo, healthcare)
export const AuthorityRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const authorityRoles = ['admin', 'gov', 'ngo', 'healthcare'];

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!authorityRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Protects routes for admin only
export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default ProtectedRoute;
