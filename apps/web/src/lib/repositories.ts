import 'server-only';
import {
  createFhirRepositories,
  getMockRepositories,
  type AppointmentRepository,
  type AppointmentStatus,
  type CreateAppointmentInput,
  type Doctor,
  type DoctorRepository,
  type MedicalRepositories,
} from '@medical-platform/domain';
import {
  PrismaDoctorExternalIdResolver,
  PrismaPatientClinicIdentityStore,
  PrismaPatientRepository,
} from '@medical-platform/domain/adapters/platform';
import {
  OscarAppointmentRepository,
  OscarDoctorRepository,
} from '@medical-platform/domain/adapters/oscar';
import { getOscarClient, OSCAR_CLINIC_ID } from '@/lib/oscar/client';

// OscarClient construction needs an async credential lookup (ClinicCredential
// is decrypted from Postgres, not an env var — see design doc §7/§8), but
// every other repository here is resolved synchronously at module load. These
// two thin wrappers resolve the client lazily per-call instead of making the
// whole `repositories` export a Promise, which would ripple into every
// caller (phone-auth-service, server-services, every API route).
class LazyOscarDoctorRepository implements DoctorRepository {
  async findAll(): Promise<Doctor[]> {
    return new OscarDoctorRepository(await getOscarClient()).findAll();
  }

  async findById(id: string): Promise<Doctor | null> {
    return new OscarDoctorRepository(await getOscarClient()).findById(id);
  }
}

class LazyOscarAppointmentRepository implements AppointmentRepository {
  private readonly identities = new PrismaPatientClinicIdentityStore();
  private readonly doctors = new PrismaDoctorExternalIdResolver();

  private async repo(): Promise<OscarAppointmentRepository> {
    return new OscarAppointmentRepository(
      await getOscarClient(),
      OSCAR_CLINIC_ID,
      this.identities,
      this.doctors
    );
  }

  async findAll(filters?: {
    patientId?: string;
    doctorId?: string;
    date?: string;
  }) {
    return (await this.repo()).findAll(filters);
  }

  async findById(id: string) {
    return (await this.repo()).findById(id);
  }

  async findDetailById(id: string) {
    return (await this.repo()).findDetailById(id);
  }

  async create(input: CreateAppointmentInput) {
    return (await this.repo()).create(input);
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    return (await this.repo()).updateStatus(id, status);
  }
}

function createOscarRepositories(): MedicalRepositories {
  return {
    // Patient identity is platform-owned regardless of EMR (see
    // docs/oscar/new-approach/patient-clinic-linking-architecture.md) —
    // registration never contacts OSCAR, so no lazy client needed here.
    patients: new PrismaPatientRepository(),
    doctors: new LazyOscarDoctorRepository(),
    appointments: new LazyOscarAppointmentRepository(),
  };
}

/**
 * Single source of truth for the data layer, shared by every server module
 * (API services AND phone auth). Resolving this in one place keeps the
 * logged-in patient identity consistent with the data the app reads/writes:
 *
 * - `mock`  (default): in-memory JSON repositories.
 * - `fhir`: FHIR R4 server (HAPI locally, OSCAR sandbox/prod later).
 * - `oscar`: real OSCAR EMR 19 REST API (OAuth1-signed) + our own Postgres
 *   for platform-owned patient identity.
 */
function resolveRepositories(): MedicalRepositories {
  if (process.env.DATA_SOURCE === 'oscar') {
    return createOscarRepositories();
  }

  if (process.env.DATA_SOURCE === 'fhir') {
    return createFhirRepositories({
      baseUrl: process.env.FHIR_BASE_URL ?? 'http://localhost:8080/fhir',
      token: process.env.FHIR_TOKEN,
    });
  }

  return getMockRepositories();
}

export const repositories = resolveRepositories();
