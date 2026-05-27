'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthenticatedUser } from '@medical-platform/auth';
import { fetchSession, logoutRequest } from './auth-api';

export const authSessionQueryKey = ['auth', 'session'] as const;

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  refreshSession: async () => undefined,
  logout: async () => undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: authSessionQueryKey,
    queryFn: fetchSession,
  });

  const refreshSession = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: authSessionQueryKey });
  }, [queryClient]);

  const logout = useCallback(async () => {
    await logoutRequest();
    queryClient.setQueryData(authSessionQueryKey, null);
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user: sessionQuery.data ?? null,
      isAuthenticated: Boolean(sessionQuery.data),
      isLoading: sessionQuery.isLoading,
      refreshSession,
      logout,
    }),
    [
      logout,
      refreshSession,
      sessionQuery.data,
      sessionQuery.isLoading,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
