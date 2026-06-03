'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Button, LoadingState } from '@/components/ui';
import { usePhoneAuthStore } from '@/features/phone-auth/store/phone-auth-store';
import { useAuth } from '@/lib/auth';
import { normalizeAppPath } from '@/lib/routing/normalize-app-path';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const openAuth = usePhoneAuthStore((state) => state.openAuth);
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
    openAuth({
      pendingAction: {
        type: 'navigate',
        href: normalizeAppPath(pathname),
      },
    });
  }, [isAuthenticated, isLoading, openAuth, pathname]);

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
        <h1 className="text-lg font-semibold text-slate-900">Sign in required</h1>
        <p className="text-sm text-slate-600">
          This section is linked to your health account. Sign in with your phone
          to continue.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Button
            type="button"
            fullWidth
            onClick={() =>
              openAuth({
                pendingAction: {
                  type: 'navigate',
                  href: normalizeAppPath(pathname),
                },
              })
            }
          >
            Sign in with phone
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
