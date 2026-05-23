'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/ui';

const navItems = [
  { href: '/home', label: 'Map', shortLabel: 'Map' },
  { href: '/dashboard', label: 'Overview', shortLabel: 'Overview' },
  { href: '/dashboard/patients', label: 'Patients', shortLabel: 'Patients' },
  { href: '/dashboard/doctors', label: 'Doctors', shortLabel: 'Doctors' },
  {
    href: '/dashboard/appointments',
    label: 'Appointments',
    shortLabel: 'Appts',
  },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-slate-100">
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 border-e border-slate-200 bg-white p-4 lg:block">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Medical Platform
          </p>
          <p className="text-sm text-slate-500">Clinic MVP</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = isNavActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  active
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-dvh flex-col lg:ps-64">
        <main className="flex-1 px-4 pb-24 pt-4 sm:px-5 lg:px-8 lg:pb-8 lg:pt-6">
          {children}
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        aria-label="Main navigation"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {navItems.map((item) => {
            const active = isNavActive(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition active:opacity-70',
                    active ? 'text-teal-700' : 'text-slate-500'
                  )}
                >
                  {active ? (
                    <span className="absolute inset-x-1 top-0 h-0.5 rounded-full bg-teal-600" />
                  ) : null}
                  <span>{item.shortLabel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
