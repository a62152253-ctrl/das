import React from 'react';
import { AuthView } from '@/types';
import { useAuth } from '../../lib/AuthContext';

interface RoleGuardProps {
  allowedRoles: ('client' | 'firma' | 'admin')[];
  children: React.ReactNode;
  fallbackView?: AuthView;
}

export function RoleGuard({ allowedRoles, children, fallbackView = 'home' }: RoleGuardProps) {
  const { profile, loading } = useAuth();

  if (loading) {
    return null; // or a loading indicator
  }

  const hasAccess = profile && allowedRoles.includes(profile.role as any);

  if (hasAccess) {
    return <>{children}</>;
  }

  // If not allowed, render nothing (App will handle routing) or fallback view
  // Here we simply return null; App's routing will redirect.
  return null;
}
