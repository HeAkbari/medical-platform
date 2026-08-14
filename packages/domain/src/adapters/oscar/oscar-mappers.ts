import type { Appointment, AppointmentStatus, Doctor } from '../../types/models';
import type {
  OscarAppointmentTo1,
  OscarDayApptItem,
  OscarProvider,
  OscarProviderPeriodAppsTo,
} from './oscar-types';

export function oscarToDoctor(provider: OscarProvider, clinicName?: string): Doctor {
  return {
    id: String(provider.providerNo),
    firstName: provider.firstName,
    lastName: provider.lastName,
    specialty: provider.specialty?.trim() || 'General Practitioner',
    email: provider.email ?? '',
    phone: provider.phone || provider.workPhone || '',
    createdAt: '',
    clinicName,
  };
}

function combineDateTime(date: string, time?: string): string {
  if (!date) {
    return '';
  }

  if (!time) {
    return date;
  }

  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  const parsed = new Date(`${date}T${normalizedTime}`);

  return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString();
}

/**
 * OSCAR's appointment status is a single-letter code, clinic-configurable —
 * only 'c' (cancelled) is confirmed so far (see design doc's flagged
 * vocabulary-gap risk). Everything else maps to 'scheduled' until more
 * codes are verified against real data.
 */
function mapOscarAppointmentStatus(code: string | undefined): AppointmentStatus {
  return code === 'c' ? 'cancelled' : 'scheduled';
}

/** From `POST /schedule/{demographicNo}/appointmentHistory` — used for a specific, already-known platform patient. */
export function oscarAppointmentHistoryToDomain(
  item: OscarAppointmentTo1,
  platformPatientId: string
): Appointment {
  return {
    id: String(item.id),
    patientId: platformPatientId,
    doctorId: item.providerNo,
    scheduledAt: combineDateTime(item.appointmentDate, item.startTime),
    // AppointmentTo1 doesn't expose a duration field directly; startTime/endTime
    // would need to be diffed once endTime's real format is confirmed live.
    durationMinutes: 30,
    status: mapOscarAppointmentStatus(item.status),
    reason: item.reason || '',
    notes: item.notes || null,
    createdAt: '',
    patientName: item.name,
  };
}

/**
 * From `GET /schedule/fetchProviderAppts/{providerNo}/{sDate}/{eDate}` — queried
 * by doctor, so each item may belong to a different patient. We don't reverse-map
 * demographicNo -> platform patientId here (no store method for that yet); this
 * path is for a doctor's schedule/day view, not a patient's own appointment list.
 */
export function oscarProviderApptToDomain(item: OscarProviderPeriodAppsTo): Appointment {
  return {
    id: String(item.appointmentNo),
    patientId: String(item.demographicNo),
    doctorId: item.providerNo,
    scheduledAt: item.appointmentDate,
    durationMinutes: 30,
    status: mapOscarAppointmentStatus(item.status),
    reason: '',
    notes: item.notes || null,
    createdAt: '',
    patientName: item.name,
  };
}

/**
 * From `GET /schedule/{providerNo}/day/{date}` — field names not yet fully
 * verified live (PatientListApptItemBean), kept defensive on purpose.
 */
export function oscarDayApptToDomain(item: OscarDayApptItem, fallbackDate: string): Appointment {
  return {
    id: String(item.appointmentNo ?? item.id ?? ''),
    patientId: item.demographicNo != null ? String(item.demographicNo) : '',
    doctorId: item.providerNo ?? '',
    scheduledAt: combineDateTime(item.appointmentDate ?? fallbackDate, item.startTime),
    durationMinutes: 30,
    status: mapOscarAppointmentStatus(item.status),
    reason: '',
    notes: item.notes || null,
    createdAt: '',
    patientName: item.name,
  };
}
