'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Drawer } from 'vaul';
import { cn } from '@/components/ui/cn';
import { Switch } from '@/components/ui/switch';
import {
  NavDrawerIconGlyph,
  NavDrawerItemIcon,
  type NavDrawerIconName,
} from '@/components/layout/nav-drawer-icon';
import { COMPLIANCE_LINKS } from '@/features/app-home/data/home-search';
import { usePhoneAuthStore } from '@/features/phone-auth/store/phone-auth-store';
import { useSettingsStore } from '@/features/settings/store/settings-store';
import { useThemeStore } from '@/features/settings/store/theme-store';
import {
  useNavDrawerDirection,
} from '@/hooks/use-document-direction';
import { useAuth } from '@/lib/auth';

interface NavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type NavDrawerPanel = 'root' | 'settings' | 'contact';

function subPanelSlideClass(isActive: boolean) {
  return isActive
    ? 'translate-x-0'
    : '-translate-x-full rtl:translate-x-full';
}

function NavDrawerSubPanelHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-brand transition hover:bg-accent active:opacity-80"
      >
        <ChevronBackIcon />
        Back
      </button>
      <h2 className="flex-1 text-center text-sm font-semibold text-foreground">
        {title}
      </h2>
      <span className="w-18" aria-hidden="true" />
    </div>
  );
}

function ChevronForwardIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-4 w-4 shrink-0 text-faint-foreground rtl:rotate-180"
      aria-hidden="true"
    >
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronBackIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-4 w-4 shrink-0 rtl:rotate-180"
      aria-hidden="true"
    >
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getUserInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || '?';
}

function ProfileGuestIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NavDrawerUserHeader({
  onSignIn,
  onNavigate,
}: {
  onSignIn: () => void;
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
        className="block rounded-xl border border-border bg-muted/60 p-3 transition hover:bg-accent active:opacity-80"
      >
        <div className="flex items-center gap-3">
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
              {user.email}
            </span>
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted/60 p-3">
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
          aria-hidden="true"
        >
          <ProfileGuestIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Guest</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={onSignIn}
              className="font-medium text-brand transition hover:underline active:opacity-80"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function NavDrawerSettingsPanel({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: () => void;
}) {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const notifications = useSettingsStore((state) => state.notifications);
  const setNotificationPref = useSettingsStore((state) => state.setNotificationPref);

  return (
    <div className="flex h-full flex-col">
      <NavDrawerSubPanelHeader title="Settings" onBack={onBack} />

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint-foreground">
            App view
          </p>
          <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3">
            <div className="flex items-start gap-2.5">
              <NavDrawerItemIcon name="notifications" size="sm" className="mt-0.5" />
              <div className="min-w-0 flex-1">
                <Switch
                  label="Notifications"
                  checked={notifications.push}
                  onCheckedChange={(v) => setNotificationPref('push', v)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <NavDrawerItemIcon name="theme" size="sm" />
              <span className="flex-1 text-sm text-foreground">Theme</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-medium transition',
                    theme === 'light'
                      ? 'bg-brand text-brand-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent',
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
                      : 'bg-muted text-muted-foreground hover:bg-accent',
                  )}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint-foreground">
            App Security
          </p>
          <div className="space-y-0.5 rounded-xl border border-border bg-muted/40 p-2">
            {(
              [
                { label: 'Two-step verification', icon: 'two-step' },
                { label: 'FaceID / Passcode', icon: 'face-id' },
              ] as const
            ).map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2 text-sm text-subtle-foreground transition hover:bg-accent active:opacity-70"
              >
                <NavDrawerIconGlyph name={item.icon} size="sm" />
                {item.label}
                <span className="ms-auto text-xs text-faint-foreground">
                  Coming soon
                </span>
              </button>
            ))}
            <button
              type="button"
              className="flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2 text-sm text-error-foreground transition hover:bg-error-subtle active:opacity-70"
            >
              <NavDrawerIconGlyph name="delete-account" size="sm" />
              Delete account
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint-foreground">
            Legal
          </p>
          <div className="space-y-0.5 rounded-xl border border-border bg-muted/40 p-2">
            {COMPLIANCE_LINKS.filter((l) =>
              ['Terms of use', 'PIPA privacy policy'].includes(l.label),
            ).map((link) => {
              const icon: NavDrawerIconName =
                link.label === 'Terms of use' ? 'terms' : 'privacy';

              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onNavigate}
                  className="flex min-h-9 items-center gap-2.5 rounded-lg px-2 text-sm text-brand transition hover:bg-accent active:opacity-70"
                >
                  <NavDrawerIconGlyph name={icon} size="sm" />
                  {link.label} →
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavDrawerContactPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <NavDrawerSubPanelHeader title="Contact" onBack={onBack} />

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint-foreground">
            Contact Us
          </p>
          <div className="space-y-0.5 rounded-xl border border-border bg-muted/40 p-2">
            <a
              href="tel:+16041234567"
              className="flex min-h-9 items-center gap-2.5 rounded-lg px-2 text-sm text-brand transition hover:bg-accent active:opacity-70"
            >
              <NavDrawerIconGlyph name="call" size="sm" />
              Call
            </a>
            <a
              href="mailto:support@drfinder.ca"
              className="flex min-h-9 items-center gap-2.5 rounded-lg px-2 text-sm text-brand transition hover:bg-accent active:opacity-70"
            >
              <NavDrawerIconGlyph name="email" size="sm" />
              Email
            </a>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint-foreground">
            App Feedback
          </p>
          <div className="rounded-xl border border-border bg-muted/40 p-2">
            <button
              type="button"
              className="flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2 text-sm text-subtle-foreground transition hover:bg-accent active:opacity-70"
            >
              <NavDrawerIconGlyph name="rate-app" size="sm" />
              Rate this app
              <span className="ms-auto text-xs text-faint-foreground">
                Coming soon
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NavDrawer({ open, onOpenChange }: NavDrawerProps) {
  const drawerDirection = useNavDrawerDirection();
  const { isAuthenticated, logout } = useAuth();
  const openAuth = usePhoneAuthStore((state) => state.openAuth);
  const [panel, setPanel] = useState<NavDrawerPanel>('root');
  const isSubPanel = panel !== 'root';
  const isSettingsPanel = panel === 'settings';
  const isContactPanel = panel === 'contact';

  function closeDrawer() {
    onOpenChange(false);
  }

  function handleDrawerOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setPanel('root');
    }
    onOpenChange(nextOpen);
  }

  function handleSignIn() {
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
      onOpenChange={handleDrawerOpenChange}
      direction={drawerDirection}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-110 bg-black/40" />
        <Drawer.Content
          className="fixed inset-s-0 inset-y-0 z-110 flex w-[min(100%,20rem)] flex-col bg-surface outline-none"
        >
          <div className="flex h-full flex-col overflow-hidden p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <Drawer.Title className="sr-only">Menu</Drawer.Title>

            <NavDrawerUserHeader
              onSignIn={handleSignIn}
              onNavigate={closeDrawer}
            />

            <div className="relative mt-4 min-h-0 flex-1 overflow-hidden">
              <div
                className={cn(
                  'absolute inset-0 flex flex-col overflow-y-auto transition-transform duration-300 ease-out',
                  isSubPanel && '-translate-x-full rtl:translate-x-full',
                )}
              >
                <nav
                  className="flex flex-1 flex-col gap-0.5"
                  aria-label="App menu"
                  aria-hidden={isSubPanel}
                >
                  <Link
                    href="/home/map"
                    scroll={false}
                    onClick={closeDrawer}
                    className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-subtle-foreground transition hover:bg-accent active:opacity-70"
                  >
                    <NavDrawerItemIcon name="map" />
                    Map View
                  </Link>

                  <Link
                    href="/healthcare-team"
                    onClick={closeDrawer}
                    className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-subtle-foreground transition hover:bg-accent active:opacity-70"
                  >
                    <NavDrawerItemIcon name="healthcare-team" />
                    Your Healthcare Team
                  </Link>

                  <div className="my-1 border-t border-border" />

                  <button
                    type="button"
                    onClick={() => setPanel('settings')}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-subtle-foreground transition hover:bg-accent active:opacity-70"
                  >
                    <NavDrawerItemIcon name="settings" />
                    <span className="flex-1 text-start">Settings</span>
                    <ChevronForwardIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPanel('contact')}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-subtle-foreground transition hover:bg-accent active:opacity-70"
                  >
                    <NavDrawerItemIcon name="contact" />
                    <span className="flex-1 text-start">Contact</span>
                    <ChevronForwardIcon />
                  </button>

                  <div className="my-1 border-t border-border" />

                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-start text-sm font-medium text-error-foreground transition hover:bg-error-subtle active:opacity-70"
                    >
                      <NavDrawerItemIcon
                        name="logout"
                        className="text-error-foreground"
                      />
                      Sign out
                    </button>
                  ) : null}
                </nav>
              </div>

              <div
                className={cn(
                  'absolute inset-0 overflow-y-auto transition-transform duration-300 ease-out',
                  subPanelSlideClass(isSettingsPanel),
                )}
                aria-hidden={!isSettingsPanel}
              >
                <NavDrawerSettingsPanel
                  onBack={() => setPanel('root')}
                  onNavigate={closeDrawer}
                />
              </div>

              <div
                className={cn(
                  'absolute inset-0 overflow-y-auto transition-transform duration-300 ease-out',
                  subPanelSlideClass(isContactPanel),
                )}
                aria-hidden={!isContactPanel}
              >
                <NavDrawerContactPanel onBack={() => setPanel('root')} />
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
