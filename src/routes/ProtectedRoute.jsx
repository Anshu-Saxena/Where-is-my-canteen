import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // If unauthorized, redirect to their role-appropriate root
    if (role === 'canteen_owner') return <Navigate to="/owner/dashboard" replace />;
    if (role === 'university_admin') return <Navigate to="/university-admin/dashboard" replace />;
    if (role === 'platform_admin') return <Navigate to="/platform-admin/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Outlet />;
}
