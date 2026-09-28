'use client';

import { useBackNavigation } from '@/hooks';
import { useAuthRedirectStore } from '@/features/auth/store/auth-redirect-store';

export function AuthBackButton({ onBack }: { onBack?: () => void }) {
  const navigateBack = useBackNavigation('/home');
  const setPendingAction = useAuthRedirectStore((state) => state.setPendingAction);

  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }

    // Leaving without signing in abandons whatever sent the user here, so a
    // later unrelated sign-in doesn't jump to that stale destination.
    setPendingAction(null);
    navigateBack();
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="mb-2 inline-flex min-h-11 items-center text-sm font-medium text-brand"
    >
      ← Back
    </button>
  );
}
