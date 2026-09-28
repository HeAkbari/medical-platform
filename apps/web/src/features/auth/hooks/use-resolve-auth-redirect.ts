'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useAuthRedirectStore } from '@/features/auth/store/auth-redirect-store';

const DEFAULT_AUTHENTICATED_HREF = '/home';

/**
 * Resolves whatever pending action sent the user to /login or /register
 * (navigate back to a page, resume booking a doctor, reopen a facility's
 * appointment drawer) once sign-in/registration succeeds. Falls back to the
 * home page when there was no pending action (e.g. a direct visit to /login).
 */
export function useResolveAuthRedirect() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const completePendingAction = useAuthRedirectStore(
    (state) => state.completePendingAction
  );

  return async function resolveAfterAuth() {
    await refreshSession();
    const pendingAction = useAuthRedirectStore.getState().pendingAction;
    completePendingAction();

    if (pendingAction?.type === 'navigate') {
      router.push(pendingAction.href);
      return;
    }

    if (pendingAction?.type === 'book-appointment') {
      router.push(
        pendingAction.doctorId
          ? `/physicians/${pendingAction.doctorId}/book`
          : '/find-physician'
      );
      return;
    }

    if (pendingAction?.type === 'appointment') {
      router.push('/home/map');
      return;
    }

    router.push(DEFAULT_AUTHENTICATED_HREF);
  };
}
