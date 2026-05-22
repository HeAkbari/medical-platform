'use client';

import { createContext, useContext } from 'react';
import type { AuthenticatedUser } from '@medical-platform/auth';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
});

export function AuthProvider({
  children,
  user = null,
}: {
  children: React.ReactNode;
  user?: AuthenticatedUser | null;
}) {
  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
