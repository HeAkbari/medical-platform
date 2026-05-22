'use client';

import { useAuth } from '@/lib/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  // Mock MVP: auth is optional until login is implemented
  void isAuthenticated;

  return <>{children}</>;
}
