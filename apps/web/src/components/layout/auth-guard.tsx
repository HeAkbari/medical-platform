'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Button, LoadingState } from '@/components/ui';
import { useAuthRedirectStore } from '@/features/auth/store/auth-redirect-store';
import { useAuth } from '@/lib/auth';
import { normalizeAppPath } from '@/lib/routing/normalize-app-path';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const setPendingAction = useAuthRedirectStore((state) => state.setPendingAction);
  const router = useRouter();
  const pathname = usePathname();
  const hasPromptedRef = useRef(false);

  useEffect(() => {
    if (isLoading || isAuthenticated) {
      return;
    }

    if (hasPromptedRef.current) {
      return;
    }

    hasPromptedRef.current = true;
    setPendingAction({ type: 'navigate', href: normalizeAppPath(pathname) });
    // replace, not push: Back from /login must not land on this guarded page,
    // which would immediately redirect to /login again.
    router.replace('/login');
  }, [isAuthenticated, isLoading, pathname, router, setPendingAction]);

  useEffect(() => {
    if (isAuthenticated) {
      hasPromptedRef.current = false;
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <LoadingState label="Checking session..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4 py-10 text-center">
        <h1 className="text-lg font-semibold text-foreground">Sign in required</h1>
        <p className="text-sm text-muted-foreground">
          This section is linked to your health account. Sign in to continue.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Button
            type="button"
            fullWidth
            onClick={() => {
              setPendingAction({ type: 'navigate', href: normalizeAppPath(pathname) });
              router.push('/login');
            }}
          >
            Sign in
          </Button>
          <Link
            href="/home"
            className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-brand"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
