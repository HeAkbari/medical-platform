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
