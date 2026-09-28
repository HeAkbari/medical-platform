import type {
  Appointment,
  AppointmentStatus,
  Doctor,
  DoctorClinicAddress,
} from '../../types/models';
import type {
  AllergyDetail,
  HealthRecordEntry,
  LabResult,
  Prescription,
  PrescriptionDetail,
  Vaccination,
  VaccinationDetail,
} from '../../types/health-records';
import type {
  OscarAllergy,
  OscarAppointmentTo1,
  OscarDayApptItem,
  OscarDiseaseRegistryItem,
  OscarDrug,
  OscarHl7LabMessage,
  OscarPrevention,
  OscarProvider,
  OscarProviderPeriodAppsTo,
} from './oscar-types';
import type { OscarSoapAppointment } from './oscar-soap-types';

/** `undefined` when OSCAR has no real street address on file for this provider (common — see providerjson sample), rather than showing an empty address block. */
function mapOscarProviderAddress(provider: OscarProvider): DoctorClinicAddress | undefined {
  const street = provider.address?.address?.trim();

  if (!street) {
    return undefined;
  }

  return {
    street,
    city: provider.address?.city?.trim() || '',
    province: provider.address?.province?.trim() || '',
    postalCode: provider.address?.postal?.trim() || '',
  };
}

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
    clinicAddress: mapOscarProviderAddress(provider),
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
 * ⚠️ REVERTED (2026-09-27): this used to treat `code === 'c'`/`'C'` as
 * "cancelled" — that was a guess from the original design doc, never
 * actually verified against a real cancellation. It turned out to be
 * actively wrong: 'C'/'c' is also the real `ScheduleTemplateCode` value for
 * "Clinic Appointment"/"On Call Clinic" (see
 * oscar-verified-service-catalog.md) — and `OscarAppointmentRepository.create`
 * sets exactly that code on every new booking (a legitimate, active
 * appointment type, not a cancellation). Treating it as "cancelled" made
 * every real booking show up as cancelled in the patient's appointment list
 * — confirmed live (2026-09-27) via `GET /api/v1/appointments?patientId=...`
 * showing brand-new, never-cancelled bookings as `status: "cancelled"`.
 *
 * We do not yet have verified evidence of what code (if any) actually means
 * "cancelled" for this field — every real code we've seen so far
 * (`getScheduleTemplateCodes`) is an appointment *type*, not a lifecycle
 * state. Until that's found and verified live, everything maps to
 * 'scheduled' — under-reporting cancellation is much safer than the
 * false-positive this replaced. See `toOscarStatusCode` in
 * oscar-repositories.ts (the cancel/`updateStatus` write path) for the
 * matching open risk — it likely doesn't actually cancel anything right now.
 */
function mapOscarAppointmentStatus(_code: string | undefined): AppointmentStatus {
  return 'scheduled';
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

/** "10:00 AM" -> {hour: 10, minute: 0} (24-hour). Returns null if unparseable. */
function parse12HourTime(label: string): { hour: number; minute: number } | null {
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return null;
  }

  let hour = Number(match[1]) % 12;

  if (match[3].toUpperCase() === 'PM') {
    hour += 12;
  }

  return { hour, minute: Number(match[2]) };
}

/** "14m " -> 14. Returns the fallback if no leading number is found. */
function parseDurationMinutes(duration: string | undefined, fallback: number): number {
  const match = duration?.match(/\d+/);
  return match ? Number(match[0]) : fallback;
}

/**
 * From `GET /schedule/{providerNo}/day/{date}` — verified live (2026-09-01).
 * `fallbackDate` (the request's own `date` path param, e.g. "2026-09-21") is
 * used rather than `item.date` (an epoch-ms field of unverified meaning) —
 * we already know and trust the day we asked for. Built with an explicit
 * `Z` suffix rather than a locale-dependent `new Date(...)` parse — this
 * keeps it in the same (possibly mislabeled, but internally consistent)
 * numeric space as `OscarScheduleTimeSlot.date` from the SOAP schedule
 * template (see oscar-soap-schedule-services.md), which is what this value
 * gets compared against for booked/free overlap detection.
 */
export function oscarDayApptToDomain(item: OscarDayApptItem, fallbackDate: string): Appointment {
  const time = item.startTime ? parse12HourTime(item.startTime) : null;
  const scheduledAt = time
    ? `${fallbackDate}T${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}:00.000Z`
    : fallbackDate;

  return {
    id: String(item.appointmentNo ?? item.id ?? ''),
    patientId: item.demographicNo != null ? String(item.demographicNo) : '',
    doctorId: item.providerNo ?? '',
    scheduledAt,
    durationMinutes: parseDurationMinutes(item.duration, 30),
    status: mapOscarAppointmentStatus(item.status),
    reason: '',
    notes: item.notes || null,
    createdAt: '',
    patientName: item.name,
  };
}

/**
 * From `ScheduleService.getAppointment2` (SOAP) — queried by OSCAR's own
 * appointment id, so (like `oscarProviderApptToDomain`) we don't reverse-map
 * `demographicNo`/`providerNo` -> platform patientId/doctorId here (no store
 * method for that yet); `patientId` here is OSCAR's raw `demographicNo`, not
 * the platform patient id. Unlike the REST mappers above, this one gets a
 * real end time from OSCAR, so `durationMinutes` is computed, not guessed.
 */
export function oscarSoapAppointmentToDomain(item: OscarSoapAppointment): Appointment {
  const start = new Date(item.appointmentStartDateTime);
  const end = new Date(item.appointmentEndDateTime);
  const durationMinutes =
    Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())
      ? 30
      : Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));

  return {
    id: String(item.id),
    patientId: String(item.demographicNo),
    doctorId: item.providerNo,
    scheduledAt: Number.isNaN(start.getTime()) ? item.appointmentStartDateTime : start.toISOString(),
    durationMinutes,
    status: mapOscarAppointmentStatus(item.status),
    reason: item.reason ?? '',
    notes: item.notes ?? null,
    createdAt: item.createDateTime ?? '',
    // Only present on getAppointmentsForPatient2's richer shape, not getAppointment2.
    patientName: item.name,
  };
}

// --- Allergies (verified live, see oscar-patient-clinical-data-api-models.md §1) ---

export function oscarAllergyToEntry(
  allergy: OscarAllergy,
  platformPatientId: string
): HealthRecordEntry {
  return {
    id: String(allergy.id),
    kind: 'allergy',
    name: allergy.description || 'Allergy',
    clinicalStatus: allergy.archived ? 'Inactive' : 'Active',
    tag: allergy.severityOfReaction || undefined,
    recordedDate: allergy.entryDate || allergy.startDate,
    patientId: platformPatientId,
  };
}

export function oscarAllergyToDetail(
  allergy: OscarAllergy,
  platformPatientId: string
): AllergyDetail {
  return {
    id: String(allergy.id),
    kind: 'allergy',
    name: allergy.description || 'Allergy',
    categories: [],
    criticality: allergy.severityOfReaction || undefined,
    clinicalStatus: allergy.archived ? 'Inactive' : 'Active',
    onsetDate: allergy.startDate,
    recordedDate: allergy.entryDate,
    // OSCAR models one reaction inline per allergy record (no nested list
    // like FHIR) — surfaced as a single-element array to fit the shared shape.
    reactions: allergy.reaction
      ? [
          {
            manifestations: [allergy.reaction],
            severity: allergy.severityOfReaction || undefined,
            description: allergy.onsetOfReaction || undefined,
          },
        ]
      : [],
    patientId: platformPatientId,
  };
}

// --- Prescriptions (verified live, see oscar-patient-clinical-data-api-models.md §3) ---

function drugMedicationName(drug: OscarDrug): string {
  return drug.customName || drug.brandName || drug.genericName || 'Medication';
}

function drugDosageInstructions(drug: OscarDrug): string[] {
  const lines = [drug.instructions, drug.additionalInstructions].filter(
    (text): text is string => Boolean(text?.trim())
  );

  if (lines.length > 0) {
    return lines;
  }

  const summary = [drug.frequency, drug.route, drug.form].filter(Boolean).join(' ').trim();
  return summary ? [summary] : [];
}

export function oscarDrugToPrescription(
  drug: OscarDrug,
  platformPatientId: string
): Prescription {
  return {
    id: String(drug.drugId),
    medication: drugMedicationName(drug),
    status: drug.archived ? 'archived' : 'active',
    authoredOn: drug.rxDate || drug.writtenDate,
    dosageInstructions: drugDosageInstructions(drug),
    repeatsAllowed: drug.repeats,
    patientId: platformPatientId,
    // Raw OSCAR providerNo, not resolved to a platform Doctor.id — this is
    // optional/display-only metadata, unlike Appointment.doctorId which
    // drives booking calls and must be the resolvable platform id.
    prescriberId: drug.providerNo,
  };
}

export function oscarDrugToPrescriptionDetail(
  drug: OscarDrug,
  platformPatientId: string,
  prescriberName?: string
): PrescriptionDetail {
  return {
    ...oscarDrugToPrescription(drug, platformPatientId),
    prescriberName,
    quantity: drug.quantity != null ? String(drug.quantity) : undefined,
    expectedSupplyDuration:
      drug.duration != null ? `${drug.duration} ${drug.durationUnit ?? ''}`.trim() : undefined,
    validityStart: drug.rxDate,
    validityEnd: drug.endDate ?? undefined,
    notes: drug.additionalInstructions || undefined,
    // No OSCAR concept for dispense history, per design doc's endpoint table.
    dispenses: [],
  };
}

// --- Immunizations (verified live, see oscar-patient-clinical-data-api-models.md §4) ---

export function oscarPreventionToVaccination(
  prevention: OscarPrevention,
  platformPatientId: string
): Vaccination {
  return {
    id: String(prevention.id),
    name: prevention.preventionType || 'Vaccine',
    status: prevention.refused ? 'refused' : prevention.never ? 'declined' : 'completed',
    date: prevention.preventionDate,
    patientId: platformPatientId,
  };
}

export function oscarPreventionToDetail(
  prevention: OscarPrevention,
  platformPatientId: string
): VaccinationDetail {
  return {
    ...oscarPreventionToVaccination(prevention, platformPatientId),
    // OSCAR's prevention record has no separate manufacturer/lot/site fields
    // — targetDiseases is the one honest inference (the prevention type IS
    // the disease it targets), everything else stays unset rather than guessed.
    targetDiseases: prevention.preventionType ? [prevention.preventionType] : [],
  };
}

// --- Condition, via dxRegisty (endpoint confirmed live, item shape unverified — see design doc §10) ---

export function oscarDiseaseRegistryItemToEntry(
  item: OscarDiseaseRegistryItem,
  platformPatientId: string
): HealthRecordEntry {
  return {
    id: String(item.id ?? ''),
    kind: 'condition',
    name: item.description || item.dxCode || 'Condition',
    clinicalStatus: item.status,
    recordedDate: item.startDate || item.updateDate,
    patientId: platformPatientId,
  };
}

// --- Test results, via hl7LabsByDemographicNo (endpoint confirmed live, item shape unverified — see design doc §10) ---

export function oscarHl7LabMessageToLabResult(
  message: OscarHl7LabMessage,
  platformPatientId: string
): LabResult {
  return {
    id: String(message.id ?? ''),
    name: message.testName || message.labType || 'Lab result',
    status: message.status || 'unknown',
    effectiveDate: message.dateTime || message.collectedDate,
    // No verified field-level result values yet — an empty array is honest
    // here; fabricating a "values" breakdown from an unconfirmed shape would
    // be worse than showing none.
    values: [],
    patientId: platformPatientId,
  };
}
