'use client';

import { useAuth } from '@/lib/auth';
import { usePhoneAuthStore } from '@/features/phone-auth/store/phone-auth-store';
import type { MapFacility } from '@/features/map/types';

type RequireAuthAction =
  | { type: 'appointment'; facility: MapFacility }
  | { type: 'book-appointment'; doctorId?: string; patientId?: string }
  | { type: 'profile' }
  | { type: 'navigate'; href: string };

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const openAuth = usePhoneAuthStore((state) => state.openAuth);

  function requireAuth(
    pendingAction: RequireAuthAction,
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
