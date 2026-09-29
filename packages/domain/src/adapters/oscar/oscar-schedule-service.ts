import { escapeXml, OscarSoapClient } from './oscar-soap-client';
import type {
  OscarDayWorkSchedule,
  OscarScheduleTemplateCode,
  OscarSoapAppointment,
} from './oscar-soap-types';

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

function parseSoapAppointmentRow(raw: unknown): OscarSoapAppointment | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const row = raw as Record<string, unknown>;

  if (row.id == null || row.demographicNo == null || row.providerNo == null) {
    return null;
  }

  return {
    id: Number(row.id),
    demographicNo: Number(row.demographicNo),
    providerNo: String(row.providerNo),
    appointmentStartDateTime: String(row.appointmentStartDateTime ?? ''),
    appointmentEndDateTime: String(row.appointmentEndDateTime ?? ''),
    createDateTime: typeof row.createDateTime === 'string' ? row.createDateTime : undefined,
    updateDateTime: typeof row.updateDateTime === 'string' ? row.updateDateTime : undefined,
    creator: typeof row.creator === 'string' ? row.creator : undefined,
    status: typeof row.status === 'string' ? row.status : undefined,
    reason: typeof row.reason === 'string' && row.reason ? row.reason : undefined,
    notes: typeof row.notes === 'string' && row.notes ? row.notes : undefined,
    programId: row.programId != null ? Number(row.programId) : undefined,
    name: typeof row.name === 'string' && row.name ? row.name : undefined,
    location: typeof row.location === 'string' && row.location ? row.location : undefined,
    remarks: typeof row.remarks === 'string' && row.remarks ? row.remarks : undefined,
    resources: typeof row.resources === 'string' && row.resources ? row.resources : undefined,
    type: typeof row.type === 'string' && row.type ? row.type : undefined,
    urgency: typeof row.urgency === 'string' && row.urgency ? row.urgency : undefined,
  };
}

/**
 * Read a single appointment by OSCAR's internal id. Not-found behaviour
 * isn't verified live yet (every test so far used a real id) — treated
 * defensively as `null`, same as `getDayWorkSchedule` above.
 */
export async function getAppointment(
  client: OscarSoapClient,
  id: number
): Promise<OscarSoapAppointment | null> {
  const body = `<ws:getAppointment2><arg0>${id}</arg0><arg1>true</arg1></ws:getAppointment2>`;
  const result = (await client.call('ScheduleService', body)) as
    | { return?: unknown[] }
    | ''
    | null;

  const raw = result && typeof result === 'object' ? result.return?.[0] : undefined;

  return parseSoapAppointmentRow(raw);
}

/**
 * `getAppointmentsForPatient2(demographicNo, offset, limit, includeArchived)`
 * — verified live (2026-09-26/27). Replaces the REST
 * `POST /schedule/{demographicNo}/appointmentHistory`, which has a
 * known, unfixable-client-side OSCAR server bug (always "Access Denied",
 * see docs/oscar/new-approach/deferred-items.md #3). The 4th argument's
 * exact meaning isn't confirmed (WSDL just says `boolean`) — verified calls
 * so far used `true`.
 */
export async function getAppointmentsForPatient(
  client: OscarSoapClient,
  demographicNo: number,
  offset = 0,
  limit = 20
): Promise<OscarSoapAppointment[]> {
  const body = `<ws:getAppointmentsForPatient2><arg0>${demographicNo}</arg0><arg1>${offset}</arg1><arg2>${limit}</arg2><arg3>true</arg3></ws:getAppointmentsForPatient2>`;
  const result = (await client.call('ScheduleService', body)) as
    | { return?: unknown[] }
    | ''
    | null;

  const rows = result && typeof result === 'object' ? (result.return ?? []) : [];

  return rows
    .map((row) => parseSoapAppointmentRow(row))
    .filter((row): row is OscarSoapAppointment => row !== null);
}

/**
 * `getAppointmentsForProvider2(providerNo, date, includeArchived)` —
 * verified live (2026-09-27). Replaces the REST
 * `GET /schedule/{providerNo}/day/{date}`, which has the same
 * unfixable-client-side OSCAR server bug as `appointmentHistory`/
 * `addAppointment` (500 "missing required security object (_demographic)"
 * — this REST endpoint internally calls `DemographicManager.getDemographic`
 * just to format the patient's display name; the SOAP call returns the
 * name directly, no separate demographic lookup/privilege check involved).
 * See docs/oscar/new-approach/deferred-items.md #3.
 *
 * ⚠️ Unreliable (verified live 2026-09-29): returns bookings for some days
 * but nothing for other days that do have bookings (REST
 * `schedule/fetchDays` shows them). No longer used by
 * OscarAppointmentRepository — kept only for reference/discovery.
 */
export async function getAppointmentsForProvider(
  client: OscarSoapClient,
  providerNo: string,
  date: string,
  includeArchived = true
): Promise<OscarSoapAppointment[]> {
  const body = `<ws:getAppointmentsForProvider2><arg0>${escapeXml(providerNo)}</arg0><arg1>${date}</arg1><arg2>${includeArchived}</arg2></ws:getAppointmentsForProvider2>`;
  const result = (await client.call('ScheduleService', body)) as
    | { return?: unknown[] }
    | ''
    | null;

  const rows = result && typeof result === 'object' ? (result.return ?? []) : [];

  return rows
    .map((row) => parseSoapAppointmentRow(row))
    .filter((row): row is OscarSoapAppointment => row !== null);
}

export interface AddAppointmentInput {
  demographicNo: number;
  providerNo: string;
  /** `YYYY-MM-DDTHH:mm:ss`, no timezone suffix — matches every verified sample. */
  appointmentStartDateTime: string;
  appointmentEndDateTime: string;
  reason: string;
  notes: string;
  /** A code from getScheduleTemplateCodes, e.g. 'C' (Clinic Appointment) — NOT a confirmed/cancelled state, see OscarSoapAppointment. */
  status: string;
  programId?: number;
}

/**
 * `ScheduleService.addAppointment(appointmentTransfer)` — verified live
 * (2026-09-25/27). Replaces REST `POST /schedule/add`, which has the same
 * unfixable-client-side "Access Denied" server bug as
 * `appointmentHistory` (`AppointmentManager.addAppointment`, see
 * docs/oscar/new-approach/deferred-items.md #3). Returns the new
 * appointment's OSCAR id.
 */
export async function addAppointment(
  client: OscarSoapClient,
  input: AddAppointmentInput
): Promise<number> {
  const body =
    `<ws:addAppointment><arg0>` +
    `<demographicNo>${input.demographicNo}</demographicNo>` +
    `<providerNo>${escapeXml(input.providerNo)}</providerNo>` +
    `<appointmentStartDateTime>${input.appointmentStartDateTime}</appointmentStartDateTime>` +
    `<appointmentEndDateTime>${input.appointmentEndDateTime}</appointmentEndDateTime>` +
    `<reason>${escapeXml(input.reason)}</reason>` +
    `<notes>${escapeXml(input.notes)}</notes>` +
    `<status>${escapeXml(input.status)}</status>` +
    `<programId>${input.programId ?? 0}</programId>` +
    `</arg0></ws:addAppointment>`;

  const result = (await client.call('ScheduleService', body)) as { return?: unknown } | '' | null;
  const id = result && typeof result === 'object' ? result.return : undefined;

  if (id == null || Number.isNaN(Number(id))) {
    throw new Error('OSCAR did not return a new appointment id from addAppointment.');
  }

  return Number(id);
}
