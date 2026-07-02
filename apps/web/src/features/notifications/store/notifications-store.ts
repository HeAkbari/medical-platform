import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  MOCK_NOTIFICATIONS,
  type AppNotification,
} from '@/features/notifications/data/mock-notifications';

interface NotificationsStore {
  notifications: AppNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set) => ({
      notifications: MOCK_NOTIFICATIONS,
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        })),
    }),
    { name: 'medical-platform:notifications' }
  )
);

export function selectUnreadNotificationCount(
  notifications: AppNotification[]
): number {
  return notifications.filter((notification) => !notification.read).length;
}
