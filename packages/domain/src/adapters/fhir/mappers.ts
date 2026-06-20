import type {
  Appointment,
  AppointmentStatus,
  Doctor,
  Patient,
} from '../../types/models';
import type {
  CreateAppointmentInput,
  CreatePatientInput,
} from '../../validation/schemas';
import type {
  FhirAppointment,
  FhirAppointmentStatus,
  FhirContactPoint,
  FhirHumanName,
  FhirPatient,
  FhirPractitioner,
} from './fhir-types';

const DEFAULT_DURATION_MINUTES = 30;

function fullName(name?: FhirHumanName[]): { first: string; last: string } {
  const primary = name?.[0];
  return {
    first: primary?.given?.[0] ?? '',
    last: primary?.family ?? '',
  };
}

function contactValue(
  telecom: FhirContactPoint[] | undefined,
  system: FhirContactPoint['system']
): string {
  return telecom?.find((entry) => entry.system === system)?.value ?? '';
}

/** Extract the bare id from a FHIR reference such as "Patient/1000". */
export function referenceId(reference?: string): string {
  if (!reference) {
    return '';
  }

  const segments = reference.split('/');
  return segments[segments.length - 1] ?? '';
}

// --- FHIR -> internal -----------------------------------------------------

export function fhirToPatient(resource: FhirPatient): Patient {
  const { first, last } = fullName(resource.name);

  return {
    id: resource.id ?? '',
    firstName: first,
    lastName: last,
    dateOfBirth: resource.birthDate ?? '',
    email: contactValue(resource.telecom, 'email'),
    phone: contactValue(resource.telecom, 'phone'),
    createdAt: resource.meta?.lastUpdated ?? '',
  };
}

export function fhirToDoctor(resource: FhirPractitioner): Doctor {
  const { first, last } = fullName(resource.name);

  return {
    id: resource.id ?? '',
    firstName: first,
    lastName: last,
    specialty: resource.qualification?.[0]?.code?.text ?? 'General Practitioner',
    email: contactValue(resource.telecom, 'email'),
    phone: contactValue(resource.telecom, 'phone'),
    createdAt: resource.meta?.lastUpdated ?? '',
  };
}

function fhirToAppointmentStatus(status: FhirAppointmentStatus): AppointmentStatus {
  switch (status) {
    case 'fulfilled':
      return 'completed';
    case 'cancelled':
    case 'noshow':
    case 'entered-in-error':
      return 'cancelled';
    default:
      return 'scheduled';
  }
}

function durationMinutes(start?: string, end?: string): number {
  if (!start || !end) {
    return DEFAULT_DURATION_MINUTES;
  }

  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(ms) || ms <= 0) {
    return DEFAULT_DURATION_MINUTES;
  }

  return Math.round(ms / 60000);
}

export function fhirToAppointment(resource: FhirAppointment): Appointment {
  const participants = resource.participant ?? [];

  const patientRef = participants.find((p) =>
    p.actor?.reference?.startsWith('Patient/')
  );
  const practitionerRef = participants.find((p) =>
    p.actor?.reference?.startsWith('Practitioner/')
  );

  return {
    id: resource.id ?? '',
    patientId: referenceId(patientRef?.actor?.reference),
    doctorId: referenceId(practitionerRef?.actor?.reference),
    scheduledAt: resource.start ?? '',
    durationMinutes: durationMinutes(resource.start, resource.end),
    status: fhirToAppointmentStatus(resource.status),
    reason: resource.description ?? '',
    notes: resource.comment ?? null,
    createdAt: resource.meta?.lastUpdated ?? '',
  };
}

// --- internal -> FHIR -----------------------------------------------------

export function patientToFhir(input: CreatePatientInput): FhirPatient {
  return {
    resourceType: 'Patient',
    name: [{ family: input.lastName, given: [input.firstName] }],
    birthDate: input.dateOfBirth,
    telecom: [
      { system: 'phone', value: input.phone },
      { system: 'email', value: input.email },
    ],
  };
}

export function appointmentToFhir(input: CreateAppointmentInput): FhirAppointment {
  const start = new Date(input.scheduledAt);
  const end = new Date(start.getTime() + input.durationMinutes * 60000);

  return {
    resourceType: 'Appointment',
    status: 'booked',
    description: input.reason,
    start: start.toISOString(),
    end: end.toISOString(),
    comment: input.notes ?? undefined,
    participant: [
      {
        actor: { reference: `Patient/${input.patientId}` },
        status: 'accepted',
      },
      {
        actor: { reference: `Practitioner/${input.doctorId}` },
        status: 'accepted',
      },
    ],
  };
}
