'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import {
  MOCK_NOTIFICATIONS,
  type AppNotification,
} from '@/features/notifications/data/mock-notifications';

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
        'w-full rounded-xl border p-3 text-left transition hover:border-brand-subtle hover:shadow-sm active:scale-[0.99] sm:p-4',
        notification.read
          ? 'border-slate-200 bg-white'
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
          <p className="font-medium text-slate-900">{notification.title}</p>
          <p className="mt-1 text-sm text-slate-600">{notification.preview}</p>
          <p className="mt-2 text-xs text-slate-500">
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
        <h1 className="text-xl font-semibold text-slate-900">
          {notification.title}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {formatNotificationDate(notification.receivedAt)}
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-700">
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
        className="inline-flex min-h-11 items-center text-sm text-slate-600 underline-offset-2 hover:text-brand hover:underline"
      >
        Notification preferences in Settings
      </Link>
    </div>
  );
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedNotification =
    notifications.find((notification) => notification.id === selectedId) ??
    null;

  function handleOpen(id: string) {
    setSelectedId(id);
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
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
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Notifications
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Appointment updates, booking confirmations, and care-plan alerts.
        </p>
      </header>

      {notifications.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">No notifications yet.</p>
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
