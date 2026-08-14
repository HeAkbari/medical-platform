import type { WeeklyHours } from '@/features/map/types';

const DAY_KEYS: (keyof WeeklyHours)[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

/** "8:00 AM" -> minutes since midnight */
function parseLabelTime(label: string): number | null {
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return null;
  }

  let hour = Number(match[1]) % 12;

  if (match[3].toUpperCase() === 'PM') {
    hour += 12;
  }

  return hour * 60 + Number(match[2]);
}

/** Moved from the (now-deleted) fhir-facility-mapper.ts — logic is EMR-agnostic. */
export function computeIsOpenNow(hours: WeeklyHours | '24/7', now = new Date()): boolean {
  if (hours === '24/7') {
    return true;
  }

  const todayKey = DAY_KEYS[now.getDay()];
  const todayHours = todayKey ? hours[todayKey] : undefined;

  if (!todayHours || todayHours === 'Closed') {
    return false;
  }

  const [open, close] = todayHours.split('–').map((part) => parseLabelTime(part));

  if (open === null || close === null) {
    return false;
  }

  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= open && minutes <= close;
}
