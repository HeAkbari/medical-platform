'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  useAuthRedirectStore,
  type PendingAuthAction,
} from '@/features/auth/store/auth-redirect-store';

export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const setPendingAction = useAuthRedirectStore((state) => state.setPendingAction);

  function requireAuth(
    pendingAction: PendingAuthAction,
    onAuthorized?: () => void
  ): boolean {
    if (isLoading) {
      return false;
    }

    if (isAuthenticated) {
      onAuthorized?.();
      return true;
    }

    setPendingAction(pendingAction);
    router.push('/login');
    return false;
  }

  return { requireAuth, isAuthenticated, isLoading };
}
