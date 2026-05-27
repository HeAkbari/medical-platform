'use client';

import { useAuth } from '@/lib/auth';
import { usePhoneAuthStore } from '@/features/phone-auth/store/phone-auth-store';
import type { MapDoctor } from '@/features/map/types';

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const openAuth = usePhoneAuthStore((state) => state.openAuth);

  function requireAuth(
    pendingAction:
      | { type: 'appointment'; doctor: MapDoctor }
      | { type: 'profile' },
    onAuthorized?: () => void
  ): boolean {
    if (isLoading) {
      return false;
    }

    if (isAuthenticated) {
      onAuthorized?.();
      return true;
    }

    openAuth({ pendingAction });
    return false;
  }

  return { requireAuth, isAuthenticated, isLoading };
}
