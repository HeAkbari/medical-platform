/**
 * `ScheduleService.getDayWorkSchedule(providerNo, date)` — verified live
 * (2026-09-01), see docs/oscar/new-approach/oscar-soap-schedule-services.md.
 */
export interface OscarDayWorkSchedule {
  holiday: boolean;
  timeSlotDurationMin: number;
  timeSlots: OscarScheduleTimeSlot[];
}

export interface OscarScheduleTimeSlot {
  date: string;
  scheduleCode: number;
}

/**
 * `ScheduleService.getScheduleTemplateCodes()` — verified live (2026-09-01).
 * `code` is NOT unique (two different `id`s can share the same `code`, e.g.
 * 67 = both "On Call Clinic" and "Clinic Appointment" on the sponsor
 * clinic's install) — `id` is the real primary key, `code` is just what
 * `OscarScheduleTimeSlot.scheduleCode` references.
 */
export interface OscarScheduleTemplateCode {
  id: number;
  code: number;
  description?: string;
  /** Minutes, when set — some codes (Academic, Travel, Meeting) have no fixed duration. */
  duration?: number;
  bookinglimit?: number;
  color?: string;
  /** 'N' | 'Day' | 'Wk' | 'Onc' | 'No' | ... — confirmation requirement, not yet used for filtering. */
  confirm?: string;
}

/**
 * `ScheduleService.getAppointment2(id, includeArchived)` — verified live
 * (2026-09-25), see docs/oscar/new-approach/oscar-verified-service-catalog.md.
 * The second `getAppointment2` argument's exact meaning isn't confirmed
 * (WSDL just says `boolean`, no doc) — every verified call so far used
 * `true`. `status` is NOT a separate confirmed/cancelled/etc state enum —
 * it's the same single-letter code as `ScheduleTemplateCode.code`
 * (case-insensitive; e.g. 'C' = a Clinic Appointment type, not "cancelled").
 */
export interface OscarSoapAppointment {
  id: number;
  demographicNo: number;
  providerNo: string;
  appointmentStartDateTime: string;
  appointmentEndDateTime: string;
  createDateTime?: string;
  updateDateTime?: string;
  creator?: string;
  status?: string;
  reason?: string;
  notes?: string;
  programId?: number;
  // Only present on `getAppointmentsForPatient2` (not `getAppointment2`) —
  // the richer `appointmentTransfer2` shape.
  name?: string;
  location?: string;
  remarks?: string;
  resources?: string;
  type?: string;
  urgency?: string;
}

/**
 * `DemographicService.searchDemographicByName(pattern, offset, limit)` —
 * verified live (2026-09-26), see
 * docs/oscar/new-approach/oscar-verified-service-catalog.md. This is the
 * flat SOAP `demographicTransfer` shape, NOT the same as the REST
 * `demographicTo1` shape used elsewhere in this codebase (POST/PUT/GET
 * `/demographics`) — notably:
 * - `address` here is one flat string, not a nested {address, city,
 *   province, postal} object.
 * - `dateOfBirth` here is ONLY THE DAY OF MONTH as a string (e.g. "21"),
 *   NOT a full date — the full date is split across this field plus
 *   `monthOfBirth`/`yearOfBirth`. Do not treat it as a date.
 * - Soft-deleted/deceased patients (`patientStatus === 'DE'`) ARE returned
 *   by this search — callers must filter them out themselves; OSCAR does
 *   not exclude them.
 */
export interface OscarSoapDemographicSearchResult {
  demographicNo: number;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  dateOfBirth?: string;
  monthOfBirth?: string;
  yearOfBirth?: string;
  hin?: string;
  email?: string;
  phone?: string;
  phone2?: string;
  address?: string;
  city?: string;
  province?: string;
  postal?: string;
  sex?: string;
  sexDesc?: string;
  patientStatus?: string;
  patientStatusDate?: string;
  providerNo?: string;
  activeCount?: number;
  hsAlertCount?: number;
  chartNo?: string;
}
