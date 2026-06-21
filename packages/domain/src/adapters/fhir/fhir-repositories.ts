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
  AppointmentRepository,
  DoctorRepository,
  MedicalRepositories,
  PatientRepository,
} from '../../ports/repositories';
import { normalizePhone } from '../../utils/helpers';
import { FhirClient, type FhirClientConfig } from './fhir-client';
import type {
  FhirAppointment,
  FhirPatient,
  FhirPractitioner,
} from './fhir-types';
import {
  appointmentStatusToFhir,
  appointmentToFhir,
  fhirToAppointment,
  fhirToDoctor,
  fhirToPatient,
  patientToFhir,
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
    const resources = await this.client.search<FhirPractitioner>('Practitioner');
    return resources.map(fhirToDoctor);
  }

  async findById(id: string): Promise<Doctor | null> {
    const resource = await this.client.read<FhirPractitioner>(
      'Practitioner',
      id
    );
    return resource ? fhirToDoctor(resource) : null;
  }
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
