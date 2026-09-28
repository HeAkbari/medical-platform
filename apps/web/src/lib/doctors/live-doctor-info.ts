import 'server-only';
import {
  OscarDoctorRepository,
  getDayWorkSchedule,
  type OscarDayWorkSchedule,
} from '@medical-platform/domain/adapters/oscar';
import type { DoctorClinicAddress, DoctorWorkingHours } from '@medical-platform/domain';
import { getOscarClient, getOscarSoapClient } from '@/lib/oscar/client';

export interface LiveDoctorInfo {
  phone?: string;
  email?: string;
  specialty?: string;
  clinicAddress?: DoctorClinicAddress;
  workingHours?: DoctorWorkingHours;
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function toMinutesSinceMidnight(naiveDateTime: string): number {
  return Number(naiveDateTime.slice(11, 13)) * 60 + Number(naiveDateTime.slice(14, 16));
}

function formatMinutes(totalMinutes: number): string {
  const hour = Math.floor(totalMinutes / 60) % 24;
  const minute = totalMinutes % 60;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
}

/**
 * Today's real OSCAR schedule, shown as if it applied to every day this
 * week. A deliberate simplification (accurate per-day-of-week hours would
 * mean 7 live SOAP calls instead of 1) — see requesting conversation,
 * 2026-09-28: intended as a temporary stand-in pending a real weekly view.
 */
function todayScheduleToWeeklyHours(schedule: OscarDayWorkSchedule): DoctorWorkingHours {
  let label = 'Closed';

  if (!schedule.holiday && schedule.timeSlots.length > 0) {
    const starts = schedule.timeSlots.map((slot) => toMinutesSinceMidnight(slot.date));
    const earliestStart = Math.min(...starts);
    const latestEnd = Math.max(...starts) + schedule.timeSlotDurationMin;
    label = `${formatMinutes(earliestStart)} – ${formatMinutes(latestEnd)}`;
  }

  return {
    monday: label,
    tuesday: label,
    wednesday: label,
    thursday: label,
    friday: label,
    saturday: label,
    sunday: label,
  };
}

/**
 * Live doctor-detail enrichment for the single-doctor detail view only
 * (never the list — see PrismaDoctorDirectoryRepository doc comment on the
 * directory-vs-detail split). Best-effort: any failure (network, provider
 * not found, SOAP credential missing) returns null and the caller keeps
 * whatever it already had (synced DB row / Facility placeholder).
 */
export async function fetchLiveDoctorInfo(
  externalProviderId: string
): Promise<LiveDoctorInfo | null> {
  try {
    const [restClient, soapClient] = await Promise.all([
      getOscarClient(),
      getOscarSoapClient(),
    ]);

    const [provider, schedule] = await Promise.all([
      new OscarDoctorRepository(restClient).findById(externalProviderId),
      getDayWorkSchedule(soapClient, externalProviderId, toDateKey(new Date())),
    ]);

    return {
      phone: provider?.phone || undefined,
      email: provider?.email || undefined,
      specialty: provider?.specialty || undefined,
      clinicAddress: provider?.clinicAddress,
      workingHours: schedule ? todayScheduleToWeeklyHours(schedule) : undefined,
    };
  } catch (error) {
    console.error('fetchLiveDoctorInfo failed (non-fatal):', error);
    return null;
  }
}
