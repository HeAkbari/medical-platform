'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import {
  selectUnreadNotificationCount,
  useNotificationsStore,
} from '@/features/notifications/store/notifications-store';
import type { AppNotification } from '@/features/notifications/data/mock-notifications';

function formatNotificationDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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
        {!notification.read ? (
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand"
            aria-hidden="true"
          />
        ) : (
          <span className="mt-1.5 h-2 w-2 shrink-0" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">
            {notification.title}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {notification.preview}
          </p>
          <p className="mt-2 text-xs text-faint-foreground">
            {formatNotificationDate(notification.receivedAt)}
          </p>
        </div>
      </div>
    </button>
  );
}

function NotificationDetail({
  notification,
  onBack,
}: {
  notification: AppNotification;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-11 items-center text-sm font-medium text-brand"
      >
        ← Back to notifications
      </button>

      <Card>
        <h1 className="text-xl font-semibold text-foreground">
          {notification.title}
        </h1>
        <p className="mt-1 text-xs text-faint-foreground">
          {formatNotificationDate(notification.receivedAt)}
        </p>
        <p className="mt-4 text-sm leading-7 text-accent-foreground">
          {notification.body}
        </p>
        {notification.href ? (
          <Link
            href={notification.href}
            scroll={false}
            className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-brand"
          >
            View related item →
          </Link>
        ) : null}
      </Card>

      <Link
        href="/settings"
        scroll={false}
        className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline-offset-2 hover:text-brand hover:underline text-faint-foreground"
      >
        Notification preferences in Settings
      </Link>
    </div>
  );
}

export function NotificationsPage() {
  const notifications = useNotificationsStore((state) => state.notifications);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedNotification =
    notifications.find((notification) => notification.id === selectedId) ??
    null;

  const unreadCount = selectUnreadNotificationCount(notifications);

  function handleOpen(id: string) {
    setSelectedId(id);
    markAsRead(id);
  }

  if (selectedNotification) {
    return (
      <NotificationDetail
        notification={selectedNotification}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Notifications
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
          <p className="text-sm text-muted-foreground">
            No notifications yet.
          </p>
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
    </div>
  );
}
