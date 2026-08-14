import type {
  Appointment,
  AppointmentDetail,
  AppointmentStatus,
  Doctor,
  Patient,
} from '../../types/models';
import type {
  CreateAppointmentInput,
  CreatePatientInput,
} from '../../validation/schemas';
import type {
  AppointmentRepository,
  DoctorRepository,
  MedicalRepositories,
  PatientRepository,
} from '../../ports/repositories';
import { normalizePhone } from '../../utils/helpers';
import { FhirClient, type FhirClientConfig } from './fhir-client';
import type {
  FhirAddress,
  FhirAppointment,
  FhirLocation,
  FhirPatient,
  FhirPractitioner,
  FhirPractitionerRole,
} from './fhir-types';
import {
  appointmentStatusToFhir,
  appointmentToFhir,
  clinicNamesByPractitioner,
  fhirToAppointment,
  fhirToDoctor,
  fhirToPatient,
  patientToFhir,
  referenceId,
} from './mappers';

class FhirPatientRepository implements PatientRepository {
  constructor(private readonly client: FhirClient) {}

  async findAll(): Promise<Patient[]> {
    const resources = await this.client.search<FhirPatient>('Patient');
    return resources.map(fhirToPatient);
  }

  async findById(id: string): Promise<Patient | null> {
    const resource = await this.client.read<FhirPatient>('Patient', id);
    return resource ? fhirToPatient(resource) : null;
  }

  async findByPhone(phone: string): Promise<Patient | null> {
    const target = normalizePhone(phone);

    // FHIR `phone` token search matches the stored telecom value exactly, so a
    // formatted number (e.g. "+1-416-555-0101") won't match normalized digits.
    // Compare on normalized digits instead. Fine for the sandbox dataset; a real
    // OSCAR endpoint can be switched back to a server-side phone search.
    const resources = await this.client.search<FhirPatient>('Patient');
    const match = resources.find((resource) =>
      (resource.telecom ?? []).some(
        (entry) =>
          entry.system === 'phone' &&
          normalizePhone(entry.value ?? '') === target
      )
    );

    return match ? fhirToPatient(match) : null;
  }

  async create(input: CreatePatientInput): Promise<Patient> {
    const created = await this.client.create<FhirPatient>(
      'Patient',
      patientToFhir(input)
    );
    return fhirToPatient(created);
  }
}

class FhirDoctorRepository implements DoctorRepository {
  constructor(private readonly client: FhirClient) {}

  async findAll(): Promise<Doctor[]> {
    const [practitioners, roles, locations] = await Promise.all([
      this.client.search<FhirPractitioner>('Practitioner'),
      this.client.search<FhirPractitionerRole>('PractitionerRole'),
      this.client.search<FhirLocation>('Location'),
    ]);
    const clinicNames = clinicNamesByPractitioner(roles, locations);

    return practitioners.map((resource) =>
      fhirToDoctor(resource, clinicNames.get(resource.id ?? ''))
    );
  }

  async findById(id: string): Promise<Doctor | null> {
    const resource = await this.client.read<FhirPractitioner>(
      'Practitioner',
      id
    );
    if (!resource) {
      return null;
    }

    const roles = await this.client.search<FhirPractitionerRole>(
      'PractitionerRole',
      { practitioner: id }
    );
    const locationId = referenceId(roles[0]?.location?.[0]?.reference);
    const location = locationId
      ? await this.client.read<FhirLocation>('Location', locationId)
      : null;

    return fhirToDoctor(resource, location?.name);
  }
}

function detailPractitionerName(resource: FhirPractitioner): string {
  const name = resource.name?.[0];
  return (
    [name?.prefix?.join(' '), name?.given?.join(' '), name?.family]
      .filter(Boolean)
      .join(' ') || 'Practitioner'
  );
}

function detailFormatAddress(address?: FhirAddress): string | undefined {
  if (!address) {
    return undefined;
  }

  return [address.line?.join(', '), address.city, address.state, address.postalCode]
    .filter(Boolean)
    .join(', ');
}

function detailContact(
  telecom: FhirPractitioner['telecom'],
  system: 'phone'
): string | undefined {
  return telecom?.find((entry) => entry.system === system)?.value;
}

class FhirAppointmentRepository implements AppointmentRepository {
  constructor(private readonly client: FhirClient) {}

  async findAll(filters?: {
    patientId?: string;
    doctorId?: string;
    date?: string;
  }): Promise<Appointment[]> {
    const resources = await this.client.search<FhirAppointment>('Appointment', {
      patient: filters?.patientId,
      practitioner: filters?.doctorId,
      date: filters?.date,
    });
    return resources.map(fhirToAppointment);
  }

  async findById(id: string): Promise<Appointment | null> {
    const resource = await this.client.read<FhirAppointment>('Appointment', id);
    return resource ? fhirToAppointment(resource) : null;
  }

  /** Aggregates the Appointment with its resolved Practitioner and Location. */
  async findDetailById(id: string): Promise<AppointmentDetail | null> {
    const resource = await this.client.read<FhirAppointment>('Appointment', id);

    if (!resource) {
      return null;
    }

    const appointment = fhirToAppointment(resource);

    const [practitioner, location] = await Promise.all([
      appointment.doctorId
        ? this.client.read<FhirPractitioner>('Practitioner', appointment.doctorId)
        : Promise.resolve(null),
      appointment.locationId
        ? this.client.read<FhirLocation>('Location', appointment.locationId)
        : Promise.resolve(null),
    ]);

    return {
      id: appointment.id,
      status: appointment.status,
      fhirStatus: appointment.fhirStatus,
      scheduledAt: appointment.scheduledAt,
      endAt: resource.end,
      durationMinutes: appointment.durationMinutes,
      serviceCategory: appointment.serviceCategory,
      serviceType: appointment.serviceType,
      specialty: appointment.specialty,
      appointmentType: appointment.appointmentType,
      priority: appointment.priority,
      reason: appointment.reason,
      reasonText: appointment.reasonText,
      comment: appointment.notes ?? undefined,
      patientInstruction: resource.patientInstruction,
      created: appointment.createdAt,
      patientName: appointment.patientName,
      doctor: appointment.doctorId
        ? {
            id: appointment.doctorId,
            name: practitioner
              ? detailPractitionerName(practitioner)
              : appointment.doctorName ?? 'Practitioner',
            specialty:
              practitioner?.qualification?.[0]?.code?.text ?? appointment.specialty,
            phone: practitioner ? detailContact(practitioner.telecom, 'phone') : undefined,
          }
        : undefined,
      location:
        appointment.locationId && (location || appointment.locationName)
          ? {
              id: appointment.locationId,
              name: location?.name ?? appointment.locationName ?? 'Location',
              address: detailFormatAddress(location?.address),
              phone: location ? detailContact(location.telecom, 'phone') : undefined,
            }
          : undefined,
    };
  }

  async create(input: CreateAppointmentInput): Promise<Appointment> {
    const created = await this.client.create<FhirAppointment>(
      'Appointment',
      appointmentToFhir(input)
    );
    return fhirToAppointment(created);
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus
  ): Promise<Appointment | null> {
    const existing = await this.client.read<FhirAppointment>('Appointment', id);
    if (!existing) {
      return null;
    }

    const updated = await this.client.update<FhirAppointment>(
      'Appointment',
      id,
      { ...existing, status: appointmentStatusToFhir(status) }
    );
    return fhirToAppointment(updated);
  }
}

/**
 * Build repositories backed by a FHIR R4 server (HAPI for local testing, and
 * later the OSCAR sandbox/production endpoint — same interface, swap the URL).
 */
export function createFhirRepositories(
  config: FhirClientConfig
): MedicalRepositories {
  const client = new FhirClient(config);

  return {
    patients: new FhirPatientRepository(client),
    doctors: new FhirDoctorRepository(client),
    appointments: new FhirAppointmentRepository(client),
  };
}
