import 'server-only';
import {
  getDayWorkSchedule,
  getScheduleTemplateCodes,
  type OscarScheduleTemplateCode,
} from '@medical-platform/domain/adapters/oscar';
import { PrismaDoctorExternalIdResolver } from '@medical-platform/domain/adapters/platform';
import { getOscarSoapClient } from '@/lib/oscar/client';
import { repositories } from '@/lib/repositories';

/**
 * Real booking availability = the doctor's REAL per-day work schedule (from
 * OSCAR's legacy SOAP ScheduleService — the only place this exists, see
 * docs/oscar/new-approach/oscar-soap-schedule-services.md) minus whatever's
 * ALREADY booked, read live from the existing REST AppointmentRepository.
 * Never persisted — computed fresh on every call.
 *
 * Filtered by visit type (`VISIT_TYPE_TO_SCHEDULE_CODE` below) — only
 * `timeSlots` whose `scheduleCode` matches the requested type are ever
 * returned, so non-patient-facing codes (Vacation, Meeting, Travel, ...)
 * are naturally excluded as a side effect of requiring an exact code match,
 * not because they're explicitly blocklisted.
 */

/**
 * Frontend visit-type key -> this clinic's real OSCAR schedule `code`
 * (verified live via getScheduleTemplateCodes — 67 = On Call
 * Clinic/Clinic Appointment, 80 = Phone Appointment). Clinic-specific by
 * nature (codes are per-clinic config, see oscar-soap-schedule-services.md)
 * — a second clinic would need its own map, not a generalized lookup, until
 * one actually exists. `virtual` has no real code yet (product decision,
 * 2026-09-01) — deliberately left unmapped so it always returns empty
 * results rather than guessing a code; the frontend toggle stays visible.
 */
const VISIT_TYPE_TO_SCHEDULE_CODE: Record<string, number | undefined> = {
  walkIn: 67,
  phone: 80,
  virtual: undefined,
};

const doctorExternalIds = new PrismaDoctorExternalIdResolver();

// Rarely changes clinic-wide — safe to cache for the life of the process,
// same pattern as the decrypted ClinicCredential cache.
let cachedTemplateCodes: Promise<OscarScheduleTemplateCode[]> | null = null;

function loadTemplateCodes(): Promise<OscarScheduleTemplateCode[]> {
  if (!cachedTemplateCodes) {
    cachedTemplateCodes = (async () => {
      const client = await getOscarSoapClient();
      return getScheduleTemplateCodes(client);
    })();
  }

  return cachedTemplateCodes;
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Which day-of-month numbers, in the given month, have a non-holiday work
 * schedule for this doctor. Unlike a static weekly template, this genuinely
 * calls OSCAR once per visible day (in parallel) — the whole point of this
 * feature is that schedules vary day-to-day, not a repeating weekly pattern.
 * A known performance tradeoff (up to ~31 live SOAP calls per month view),
 * not yet optimized — see docs/oscar/new-approach/oscar-soap-schedule-services.md.
 */
export async function getWorkingDaysInMonth(
  doctorId: string,
  year: number,
  month: number,
  visitType: string
): Promise<number[]> {
  const scheduleCode = VISIT_TYPE_TO_SCHEDULE_CODE[visitType];

  if (scheduleCode === undefined) {
    return [];
  }

  const resolved = await doctorExternalIds.resolve(doctorId);

  if (!resolved) {
    return [];
  }

  const client = await getOscarSoapClient();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const results = await Promise.all(
    Array.from({ length: totalDays }, (_, i) => i + 1).map(async (day) => {
      const date = toDateKey(new Date(year, month, day));
      const schedule = await getDayWorkSchedule(client, resolved.externalProviderId, date);
      const hasMatchingSlots = Boolean(
        schedule &&
          !schedule.holiday &&
          schedule.timeSlots.some((slot) => slot.scheduleCode === scheduleCode)
      );
      return hasMatchingSlots ? day : null;
    })
  );

  return results.filter((day): day is number => day !== null);
}

export interface AvailableSlot {
  start: string;
  durationMinutes: number;
}

/** Real available slots for one specific date, matching one visit type. */
export async function getAvailableSlots(
  doctorId: string,
  date: string,
  visitType: string
): Promise<AvailableSlot[]> {
  const scheduleCode = VISIT_TYPE_TO_SCHEDULE_CODE[visitType];

  if (scheduleCode === undefined) {
    return [];
  }

  const resolved = await doctorExternalIds.resolve(doctorId);

  if (!resolved) {
    return [];
  }

  const client = await getOscarSoapClient();
  const [schedule, codes, booked] = await Promise.all([
    getDayWorkSchedule(client, resolved.externalProviderId, date),
    loadTemplateCodes(),
    repositories.appointments.findAll({ doctorId, date }),
  ]);

  if (!schedule || schedule.holiday || schedule.timeSlots.length === 0) {
    return [];
  }

  const codesById = new Map(codes.map((c) => [c.code, c]));
  const bookedRanges = booked
    .filter((appointment) => appointment.status !== 'cancelled')
    .map((appointment) => {
      const start = new Date(appointment.scheduledAt).getTime();
      return { start, end: start + appointment.durationMinutes * 60_000 };
    });

  const now = Date.now();

  return schedule.timeSlots
    .filter((slot) => slot.scheduleCode === scheduleCode)
    .map((slot) => {
      const slotStart = new Date(slot.date).getTime();
      const durationMinutes =
        codesById.get(slot.scheduleCode)?.duration ?? schedule.timeSlotDurationMin;
      return { slot, slotStart, durationMinutes };
    })
    .filter(({ slotStart, durationMinutes }) => {
      if (slotStart <= now) {
        return false;
      }

      const slotEnd = slotStart + durationMinutes * 60_000;
      return !bookedRanges.some((range) => slotStart < range.end && slotEnd > range.start);
    })
    .map(({ slot, durationMinutes }) => ({
      start: new Date(slot.date).toISOString(),
      durationMinutes,
    }))
    .sort((a, b) => a.start.localeCompare(b.start));
}
