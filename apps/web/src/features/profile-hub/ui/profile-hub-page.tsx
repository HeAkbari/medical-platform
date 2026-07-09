'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { usePhoneAuthStore } from '@/features/phone-auth/store/phone-auth-store';

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
    </svg>
  );
}

function ProfileField({
  label,
  value,
  masked,
}: {
  label: string;
  value: string | undefined;
  masked?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const isEmpty = !value;

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-faint-foreground">{label}</span>
        <span className={`mt-0.5 block text-sm ${isEmpty ? 'text-faint-foreground italic' : 'text-foreground'}`}>
          {isEmpty
            ? 'Not set'
            : masked && !revealed
              ? `${'•'.repeat(Math.max(0, (value?.length ?? 0) - 2))}${value?.slice(-2) ?? ''}`
              : value}
        </span>
      </span>
      {masked && value ? (
        <button
          type="button"
          onClick={() => setRevealed((p) => !p)}
          aria-label={revealed ? 'Hide value' : 'Reveal value'}
          className="shrink-0 text-muted-foreground transition hover:text-foreground"
        >
          <EyeIcon visible={revealed} />
        </button>
      ) : null}
    </div>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <p className="mb-1 mt-4 text-[11px] font-semibold uppercase tracking-wider text-faint-foreground first:mt-0">
      {title}
    </p>
  );
}

function MissingFieldsBanner() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-900/60 dark:bg-amber-950/30">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true">
        <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      </svg>
      <p className="text-xs font-medium text-amber-900 dark:text-amber-300">
        Missing fields impact booking speed
      </p>
    </div>
  );
}

export function ProfileHubPage() {
  const { user, isAuthenticated } = useAuth();
  const openAuth = usePhoneAuthStore((state) => state.openAuth);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center gap-6 px-4 py-12 text-center">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-2xl font-bold text-brand-foreground"
          aria-hidden="true"
        >
          DF
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Welcome to DrFinder
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account or log in to access your profile, healthcare team, and bookings.
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            type="button"
            onClick={() => openAuth({ pendingAction: null })}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-medium text-brand-foreground transition hover:bg-brand-dark active:opacity-80"
          >
            Create an account
          </button>
          <button
            type="button"
            onClick={() => openAuth({ pendingAction: null })}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-foreground transition hover:bg-accent active:opacity-80"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  const hasMissingFields = !user.email;

  return (
    <div className="space-y-4 pb-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Profile
        </h1>
      </header>

      {/* Avatar */}
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-2xl font-bold text-brand-foreground">
          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
        </div>
      </div>

      {hasMissingFields ? <MissingFieldsBanner /> : null}

      <Card>
        <SectionDivider title="Personal Details" />
        <div className="divide-y divide-border">
          <ProfileField label="First Name" value={user.firstName} />
          <ProfileField label="Last Name" value={user.lastName} />
          <ProfileField label="Gender" value={undefined} />
          <ProfileField label="Date of Birth" value={undefined} />
        </div>

        <SectionDivider title="Healthcare & Contact" />
        <div className="divide-y divide-border">
          <ProfileField label="Healthcare Number" value="0000000081" masked />
          <ProfileField label="Phone" value={user.phone} />
          <ProfileField label="Email" value={user.email ?? undefined} />
        </div>

        <SectionDivider title="Extended Health Insurance" />
        <div className="divide-y divide-border">
          <ProfileField label="Carrier Number" value={undefined} />
          <ProfileField label="Contract Number" value={undefined} />
          <ProfileField label="Member's ID Number" value={undefined} masked />
        </div>
      </Card>
    </div>
  );
}
