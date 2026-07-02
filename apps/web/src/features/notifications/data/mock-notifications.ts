export type NotificationKind =
  | 'appointment-reminder'
  | 'booking-confirmation'
  | 'cancellation'
  | 'waitlist-callback'
  | 'care-plan-milestone';

export interface AppNotification {
  id: string;
  title: string;
  preview: string;
  body: string;
  kind: NotificationKind;
  receivedAt: string;
  read: boolean;
  href?: string;
}

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Appointment reminder',
    preview: 'Walk-in visit tomorrow at 10:30 AM with Dr. Chen.',
    body: 'Your in-clinic appointment with Dr. Mei Chen is tomorrow at 10:30 AM at Oak Bay Medical Clinic. Please bring photo ID and your BC Services Card.',
    kind: 'appointment-reminder',
    receivedAt: '2026-07-01T09:00:00.000Z',
    read: false,
    href: '/home/services/appointments',
  },
  {
    id: 'notif-2',
    title: 'Booking confirmed',
    preview: 'Virtual consultation booked for Friday at 2:00 PM.',
    body: 'Your virtual video consultation with Dr. James Okonkwo is confirmed for Friday at 2:00 PM. A secure join link will appear 15 minutes before your appointment.',
    kind: 'booking-confirmation',
    receivedAt: '2026-06-30T16:20:00.000Z',
    read: false,
    href: '/home/services/appointments',
  },
  {
    id: 'notif-3',
    title: 'Appointment cancelled',
    preview: 'Your telephone visit on June 28 was cancelled.',
    body: 'Your telephone consultation scheduled for June 28 at 11:00 AM was cancelled. You can book again from your appointments list.',
    kind: 'cancellation',
    receivedAt: '2026-06-28T08:45:00.000Z',
    read: true,
    href: '/home/services/appointments',
  },
  {
    id: 'notif-4',
    title: 'Waitlist callback window',
    preview: 'Estimated practitioner callback around 11:45 AM today.',
    body: 'You joined the walk-in waitlist at James Bay Urgent Care. Estimated practitioner callback window: 11:45 AM. Please stay available by phone.',
    kind: 'waitlist-callback',
    receivedAt: '2026-06-27T11:10:00.000Z',
    read: true,
  },
  {
    id: 'notif-5',
    title: 'Care plan milestone',
    preview: 'Annual blood panel screening is due.',
    body: 'Your Health Condition Meter shows that routine baseline lab tests are due. Book with your family physician when convenient.',
    kind: 'care-plan-milestone',
    receivedAt: '2026-06-25T14:00:00.000Z',
    read: true,
  },
];

export function countUnreadNotifications(
  notifications: AppNotification[]
): number {
  return notifications.filter((notification) => !notification.read).length;
}
