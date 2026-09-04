import { escapeXml, OscarSoapClient } from './oscar-soap-client';
import type { OscarDayWorkSchedule, OscarScheduleTemplateCode } from './oscar-soap-types';

/**
 * Real, per-day, per-provider work schedule — the piece that has no REST
 * equivalent anywhere in OSCAR's `ws/services` API (confirmed by exhaustive
 * testing, see docs/oscar/new-approach/oscar-soap-schedule-services.md).
 * `date` is a plain `YYYY-MM-DD` string; OSCAR expects a dateTime with a
 * midnight time component.
 */
export async function getDayWorkSchedule(
  client: OscarSoapClient,
  providerNo: string,
  date: string
): Promise<OscarDayWorkSchedule | null> {
  const body = `<ws:getDayWorkSchedule><arg0>${escapeXml(providerNo)}</arg0><arg1>${date}T00:00:00</arg1></ws:getDayWorkSchedule>`;
  const result = (await client.call('ScheduleService', body)) as
    | { return?: unknown[] }
    | ''
    | null;

  const raw = result && typeof result === 'object' ? result.return?.[0] : undefined;

  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const row = raw as {
    holiday?: boolean;
    timeSlotDurationMin?: number;
    timeSlots?: { date?: string; scheduleCode?: number }[];
  };

  return {
    holiday: row.holiday ?? false,
    timeSlotDurationMin: row.timeSlotDurationMin ?? 15,
    timeSlots: (row.timeSlots ?? [])
      .filter((slot): slot is { date: string; scheduleCode: number } =>
        Boolean(slot.date) && slot.scheduleCode != null
      )
      .map((slot) => ({ date: slot.date, scheduleCode: Number(slot.scheduleCode) })),
  };
}

/**
 * The full clinic-wide code definition table (bookinglimit, duration,
 * description per code `id`). Rarely changes — safe for callers to cache
 * in-process rather than fetching on every request.
 */
export async function getScheduleTemplateCodes(
  client: OscarSoapClient
): Promise<OscarScheduleTemplateCode[]> {
  const result = (await client.call('ScheduleService', '<ws:getScheduleTemplateCodes/>')) as
    | { return?: unknown[] }
    | ''
    | null;

  const rows = result && typeof result === 'object' ? (result.return ?? []) : [];

  return rows
    .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
    .map((row) => ({
      id: Number(row.id),
      code: Number(row.code),
      description: typeof row.description === 'string' ? row.description.trim() : undefined,
      duration:
        row.duration !== undefined && row.duration !== '' ? Number(row.duration) : undefined,
      bookinglimit: row.bookinglimit != null ? Number(row.bookinglimit) : undefined,
      color: typeof row.color === 'string' && row.color ? row.color : undefined,
      confirm: typeof row.confirm === 'string' ? row.confirm : undefined,
    }));
}
