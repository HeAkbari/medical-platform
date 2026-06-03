'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { usePhoneAuthStore } from '@/features/phone-auth/store/phone-auth-store';
import { PROFILE_SECTIONS } from '@/features/profile-hub/data/profile-sections';

export function ProfileHubPage() {
  const { user, isAuthenticated } = useAuth();
  const openAuth = usePhoneAuthStore((state) => state.openAuth);

  function handleSignIn() {
    openAuth({ pendingAction: null });
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Profile
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your personal details and health preferences.
        </p>
      </header>

      <Card>
        {isAuthenticated && user ? (
          <div>
            <p className="text-sm text-slate-500">Signed in as</p>
            <p className="mt-1 font-medium text-slate-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-slate-600">{user.phone}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Sign in to view and update your personal details.
            </p>
            <button
              type="button"
              onClick={handleSignIn}
              className="inline-flex min-h-11 items-center rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground"
            >
              Sign in with phone
            </button>
          </div>
        )}
      </Card>

      <ul className="space-y-2">
        {PROFILE_SECTIONS.map((section) => (
          <li key={section.slug}>
            <Link href={`/profile/${section.slug}`}>
              <Card className="transition hover:border-brand-subtle hover:shadow-sm active:scale-[0.99]">
                <p className="font-medium text-slate-900">{section.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {section.description}
                </p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
