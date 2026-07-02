'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Drawer } from 'vaul';
import { cn } from '@/components/ui/cn';
import { useNavDrawerDirection } from '@/hooks/use-document-direction';
import { useAuth } from '@/lib/auth';
import { usePhoneAuthStore } from '@/features/phone-auth/store/phone-auth-store';
import { normalizeAppPath } from '@/lib/routing/normalize-app-path';

interface NavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavDrawerItem {
  label: string;
  href?: string;
  onClick?: () => void;
  destructive?: boolean;
}

function getUserInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || '?';
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
      <p className="text-sm font-semibold text-foreground">Guest</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Sign in to access your profile and health records.
      </p>
      <button
        type="button"
        onClick={onSignIn}
        className="mt-3 inline-flex min-h-9 items-center rounded-lg bg-brand px-3 text-sm font-medium text-brand-foreground transition active:opacity-80"
      >
        Sign in with phone
      </button>
    </div>
  );
}

export function NavDrawer({ open, onOpenChange }: NavDrawerProps) {
  const pathname = usePathname();
  const normalizedPath = normalizeAppPath(pathname);
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

  async function handleLogout() {
    closeDrawer();
    await logout();
  }

  const items: NavDrawerItem[] = [
    {
      label: 'Profile',
      href: '/profile',
    },
    {
      label: 'Settings',
      href: '/settings',
    },
    {
      label: 'My Healthcare Team',
      href: '/healthcare-team',
    },
    {
      label: 'Map view',
      href: '/home/map',
    },
  ];

  if (isAuthenticated) {
    items.push({
      label: 'Log out',
      onClick: handleLogout,
      destructive: true,
    });
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
          className="fixed inset-y-0 start-0 z-110 flex w-[min(100%,18rem)] flex-col bg-surface outline-none"
        >
          <div className="flex h-full flex-col p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <Drawer.Title className="sr-only">Menu</Drawer.Title>

            <NavDrawerUserHeader
              onSignIn={handleSignIn}
              onNavigate={closeDrawer}
            />

            <nav className="mt-4 flex flex-1 flex-col gap-1" aria-label="App menu">
              {items.map((item) => {
                const active = item.href ? normalizedPath.startsWith(item.href) : false;

                if (item.href) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      scroll={item.href === '/home/map' ? false : undefined}
                      onClick={closeDrawer}
                      className={cn(
                        'flex min-h-11 items-center rounded-xl px-3 text-sm font-medium transition active:opacity-70',
                        active
                          ? 'bg-brand-muted text-brand-dark'
                          : 'text-subtle-foreground hover:bg-accent'
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className={cn(
                      'flex min-h-11 items-center rounded-xl px-3 text-start text-sm font-medium transition active:opacity-70',
                      item.destructive
                        ? 'text-error-foreground hover:bg-error-subtle'
                        : 'text-subtle-foreground hover:bg-accent'
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
