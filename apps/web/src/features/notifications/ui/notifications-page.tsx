'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Drawer } from 'vaul';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import {
  selectUnreadNotificationCount,
  useNotificationsStore,
} from '@/features/notifications/store/notifications-store';
import type { AppNotification } from '@/features/notifications/data/mock-notifications';

function formatRelativeAlert(value: string): string {
  const now = new Date();
  const date = new Date(value);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function NotificationRow({
  notification,
  onOpen,
}: {
  notification: AppNotification;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'w-full rounded-xl border p-3 text-start transition hover:border-brand-subtle hover:shadow-sm active:scale-[0.99] sm:p-4',
        notification.read
          ? 'border-border bg-card'
          : 'border-brand-subtle/80 bg-brand-muted/30'
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-1.5 h-2 w-2 shrink-0 rounded-full',
            notification.read ? 'bg-transparent' : 'bg-brand'
          )}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{notification.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{notification.preview}</p>
          <p className="mt-2 text-xs text-faint-foreground">
            {formatRelativeAlert(notification.receivedAt)}
          </p>
        </div>
      </div>
    </button>
  );
}

function AlertDetailSheet({
  notification,
  open,
  onOpenChange,
}: {
  notification: AppNotification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-1200 bg-black/40 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed bottom-0 inset-x-0 z-1300 flex max-h-[85dvh] flex-col rounded-t-2xl bg-card shadow-[0_-4px_32px_rgba(0,0,0,0.14)] outline-none">
          <Drawer.Title className="sr-only">
            {notification?.title ?? 'Alert detail'}
          </Drawer.Title>
          {/* Drag handle */}
          <div className="mx-auto mt-3 mb-1 h-1 w-10 shrink-0 rounded-full bg-muted" />
          {notification ? (
            <div className="flex-1 overflow-y-auto px-4 pb-8 pt-2">
              <p className="text-xl font-semibold text-foreground">
                {notification.title}
              </p>
              <p className="mt-1 text-xs text-faint-foreground">
                {formatRelativeAlert(notification.receivedAt)}
              </p>
              <p className="mt-4 text-sm leading-7 text-accent-foreground">
                {notification.body}
              </p>
              {notification.href ? (
                <Link
                  href={notification.href}
                  scroll={false}
                  onClick={() => onOpenChange(false)}
                  className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-brand"
                >
                  View related item →
                </Link>
              ) : null}
            </div>
          ) : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function NotificationsPage() {
  const notifications = useNotificationsStore((state) => state.notifications);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedNotification =
    notifications.find((n) => n.id === selectedId) ?? null;

  const unreadCount = selectUnreadNotificationCount(notifications);

  function handleOpen(id: string) {
    setSelectedId(id);
    markAsRead(id);
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Alerts
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Appointment updates, booking confirmations, and care-plan alerts.
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex min-h-11 items-center text-sm font-medium text-brand"
          >
            Mark all read
          </button>
        ) : null}
      </header>

      {notifications.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">No alerts yet.</p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <NotificationRow
                notification={notification}
                onOpen={() => handleOpen(notification.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Alert detail — bottom-sheet popup (v0.4 P7 spec) */}
      <AlertDetailSheet
        notification={selectedNotification}
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </div>
  );
}
