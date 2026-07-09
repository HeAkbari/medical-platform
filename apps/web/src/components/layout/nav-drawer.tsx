'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Drawer } from 'vaul';
import { cn } from '@/components/ui/cn';
import { Switch } from '@/components/ui/switch';
import { COMPLIANCE_LINKS } from '@/features/app-home/data/home-search';
import { usePhoneAuthStore } from '@/features/phone-auth/store/phone-auth-store';
import { useSettingsStore } from '@/features/settings/store/settings-store';
import { useThemeStore } from '@/features/settings/store/theme-store';
import { useNavDrawerDirection } from '@/hooks/use-document-direction';
import { useAuth } from '@/lib/auth';

interface NavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getUserInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || '?';
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavDrawerUserHeader({
  onSignIn,
  onCreateAccount,
  onNavigate,
}: {
  onSignIn: () => void;
  onCreateAccount: () => void;
  onNavigate: () => void;
}) {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    const initials = getUserInitials(user.firstName, user.lastName);
    const fullName = `${user.firstName} ${user.lastName}`.trim();

    return (
      <Link
        href="/profile"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl border border-border bg-muted/60 p-3 transition hover:bg-accent active:opacity-80"
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground"
          aria-hidden="true"
        >
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">
            {fullName}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {user.phone}
          </span>
          {user.email ? (
            <span className="mt-0.5 block truncate text-xs text-faint-foreground">
              {user.email}
            </span>
          ) : null}
        </span>
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted/60 p-3">
      <p className="text-sm font-semibold text-foreground">Welcome to DrFinder</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Sign in or create an account to access your health records.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onCreateAccount}
          className="inline-flex min-h-9 flex-1 items-center justify-center rounded-lg bg-brand px-3 text-sm font-medium text-brand-foreground transition active:opacity-80"
        >
          Create an account
        </button>
        <button
          type="button"
          onClick={onSignIn}
          className="inline-flex min-h-9 flex-1 items-center justify-center rounded-lg border border-border bg-muted px-3 text-sm font-medium text-foreground transition hover:bg-accent active:opacity-80"
        >
          Log in
        </button>
      </div>
    </div>
  );
}

function SettingsSection({ onNavigate }: { onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const notifications = useSettingsStore((state) => state.notifications);
  const setNotificationPref = useSettingsStore((state) => state.setNotificationPref);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex min-h-11 w-full items-center rounded-xl px-3 text-sm font-medium text-subtle-foreground transition hover:bg-accent active:opacity-70"
      >
        <span className="flex-1 text-start">Settings</span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div className="ms-3 mt-1 space-y-3 rounded-xl border border-border bg-muted/40 p-3">
          {/* App view */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint-foreground">
              App view
            </p>
            <div className="space-y-2">
              <Switch
                label="Notifications"
                checked={notifications.push}
                onCheckedChange={(v) => setNotificationPref('push', v)}
              />
              <div className="flex items-center gap-2">
                <span className="flex-1 text-sm text-foreground">Theme</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-xs font-medium transition',
                      theme === 'light'
                        ? 'bg-brand text-brand-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    )}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-xs font-medium transition',
                      theme === 'dark'
                        ? 'bg-brand text-brand-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    )}
                  >
                    Dark
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* App Security */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint-foreground">
              App Security
            </p>
            <div className="space-y-0.5">
              {[
                { label: 'Two-step verification' },
                { label: 'FaceID / Passcode' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="flex min-h-9 w-full items-center rounded-lg px-2 text-sm text-subtle-foreground transition hover:bg-accent active:opacity-70"
                >
                  {item.label}
                  <span className="ms-auto text-xs text-faint-foreground">
                    Coming soon
                  </span>
                </button>
              ))}
              <button
                type="button"
                className="flex min-h-9 w-full items-center rounded-lg px-2 text-sm text-error-foreground transition hover:bg-error-subtle active:opacity-70"
              >
                Delete account
              </button>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint-foreground">
              Legal
            </p>
            <div className="space-y-0.5">
              {COMPLIANCE_LINKS.filter((l) =>
                ['Terms of use', 'PIPA privacy policy'].includes(l.label)
              ).map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onNavigate}
                  className="flex min-h-9 items-center rounded-lg px-2 text-sm text-brand transition hover:bg-accent active:opacity-70"
                >
                  {link.label} →
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ContactSection() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex min-h-11 w-full items-center rounded-xl px-3 text-sm font-medium text-subtle-foreground transition hover:bg-accent active:opacity-70"
      >
        <span className="flex-1 text-start">Contact</span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div className="ms-3 mt-1 space-y-3 rounded-xl border border-border bg-muted/40 p-3">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint-foreground">
              Contact Us
            </p>
            <div className="space-y-0.5">
              <a
                href="tel:+16041234567"
                className="flex min-h-9 items-center rounded-lg px-2 text-sm text-brand transition hover:bg-accent active:opacity-70"
              >
                Call
              </a>
              <a
                href="mailto:support@drfinder.ca"
                className="flex min-h-9 items-center rounded-lg px-2 text-sm text-brand transition hover:bg-accent active:opacity-70"
              >
                Email
              </a>
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint-foreground">
              App Feedback
            </p>
            <button
              type="button"
              className="flex min-h-9 w-full items-center rounded-lg px-2 text-sm text-subtle-foreground transition hover:bg-accent active:opacity-70"
            >
              Rate this app
              <span className="ms-auto text-xs text-faint-foreground">
                Coming soon
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function NavDrawer({ open, onOpenChange }: NavDrawerProps) {
  const drawerDirection = useNavDrawerDirection();
  const { isAuthenticated, logout } = useAuth();
  const openAuth = usePhoneAuthStore((state) => state.openAuth);

  function closeDrawer() {
    onOpenChange(false);
  }

  function handleSignIn() {
    closeDrawer();
    openAuth({ pendingAction: null });
  }

  function handleCreateAccount() {
    closeDrawer();
    openAuth({ pendingAction: null });
  }

  async function handleLogout() {
    closeDrawer();
    await logout();
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      direction={drawerDirection}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-110 bg-black/40" />
        <Drawer.Content
          className="fixed inset-s-0 inset-y-0 z-110 flex w-[min(100%,20rem)] flex-col bg-surface outline-none"
        >
          <div className="flex h-full flex-col overflow-y-auto p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <Drawer.Title className="sr-only">Menu</Drawer.Title>

            <NavDrawerUserHeader
              onSignIn={handleSignIn}
              onCreateAccount={handleCreateAccount}
              onNavigate={closeDrawer}
            />

            <nav className="mt-4 flex flex-1 flex-col gap-0.5" aria-label="App menu">
              <Link
                href="/home/map"
                scroll={false}
                onClick={closeDrawer}
                className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-subtle-foreground transition hover:bg-accent active:opacity-70"
              >
                Map View
              </Link>

              <Link
                href="/healthcare-team"
                onClick={closeDrawer}
                className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-subtle-foreground transition hover:bg-accent active:opacity-70"
              >
                Your Healthcare Team
              </Link>

              <div className="my-1 border-t border-border" />

              <SettingsSection onNavigate={closeDrawer} />
              <ContactSection />

              <div className="my-1 border-t border-border" />

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-11 items-center rounded-xl px-3 text-start text-sm font-medium text-error-foreground transition hover:bg-error-subtle active:opacity-70"
                >
                  Log out
                </button>
              ) : null}
            </nav>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
