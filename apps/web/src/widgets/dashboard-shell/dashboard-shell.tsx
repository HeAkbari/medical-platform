'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DASHBOARD_BASE_PATH } from '@/config';
import { useAppUiStore } from '@/shared/hooks/use-app-ui-store';
import { cn } from '@/shared/ui';

const navItems = [
  { href: DASHBOARD_BASE_PATH, label: 'Overview' },
  { href: `${DASHBOARD_BASE_PATH}/patients`, label: 'Patients' },
  { href: `${DASHBOARD_BASE_PATH}/doctors`, label: 'Doctors' },
  { href: `${DASHBOARD_BASE_PATH}/appointments`, label: 'Appointments' },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sidebarOpen = useAppUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAppUiStore((state) => state.setSidebarOpen);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 p-4 md:p-6">
        <aside
          className={cn(
            'shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all md:w-64',
            sidebarOpen ? 'w-64' : 'w-16'
          )}
        >
          <div className="mb-6 flex items-center justify-between gap-2">
            {sidebarOpen ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                  Medical Platform
                </p>
                <p className="text-sm text-slate-500">Frontend MVP</p>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
            >
              {sidebarOpen ? 'Hide' : 'Menu'}
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== DASHBOARD_BASE_PATH &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block rounded-lg px-3 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-teal-50 text-teal-800'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  {sidebarOpen ? item.label : item.label[0]}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
