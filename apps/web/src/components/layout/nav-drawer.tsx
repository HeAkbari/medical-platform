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
  requiresAuth?: boolean;
  destructive?: boolean;
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
      label: isAuthenticated ? 'Profile' : 'Profile / Sign in',
      href: isAuthenticated ? '/profile' : undefined,
      onClick: isAuthenticated ? undefined : handleSignIn,
    },
    {
      label: 'Settings',
      href: '/settings',
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
          className="fixed inset-y-0 start-0 z-110 flex w-[min(100%,18rem)] flex-col bg-white outline-none"
        >
          <div className="flex h-full flex-col p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <Drawer.Title className="text-lg font-semibold text-slate-900">
              Menu
            </Drawer.Title>
            <p className="mt-1 text-sm text-slate-500">DrFinder patient app</p>

            <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="App menu">
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
                          : 'text-slate-800 hover:bg-slate-50'
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
                        ? 'text-red-700 hover:bg-red-50'
                        : 'text-slate-800 hover:bg-slate-50'
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
