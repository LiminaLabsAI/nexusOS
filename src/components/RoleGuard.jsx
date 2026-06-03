import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { canAccess } from '@/lib/permissions';

/**
 * Wraps a route and redirects to "/" if the current user's role
 * does not have access to the current path.
 */
export default function RoleGuard({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role || 'user';

  if (user && !canAccess(role, location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return children;
}