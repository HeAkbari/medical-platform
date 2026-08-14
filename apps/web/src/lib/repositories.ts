import 'server-only';
import {
  createFhirRepositories,
  getMockRepositories,
  type AppointmentRepository,
  type AppointmentStatus,
  type CreateAppointmentInput,
  type Doctor,
  type DoctorRepository,
  type DocumentDetail,
  type DocumentRecord,
  type DocumentRepository,
  type HealthConditionRepository,
  type HealthRecordDetail,
  type HealthRecordEntry,
  type HealthRecordKind,
  type ImmunizationRepository,
  type LabResult,
  type LabResultDetail,
  type MedicalRepositories,
  type Prescription,
  type PrescriptionDetail,
  type PrescriptionRepository,
  type TestResultRepository,
  type Vaccination,
  type VaccinationDetail,
} from '@medical-platform/domain';
import {
  PrismaDoctorExternalIdResolver,
  PrismaPatientClinicIdentityStore,
  PrismaPatientRepository,
} from '@medical-platform/domain/adapters/platform';
import {
  OscarAppointmentRepository,
  OscarDocumentRepository,
  OscarDoctorRepository,
  OscarHealthConditionRepository,
  OscarImmunizationRepository,
  OscarPrescriptionRepository,
  OscarTestResultRepository,
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

class LazyOscarPrescriptionRepository implements PrescriptionRepository {
  private readonly identities = new PrismaPatientClinicIdentityStore();

  private async repo(): Promise<OscarPrescriptionRepository> {
    return new OscarPrescriptionRepository(await getOscarClient(), OSCAR_CLINIC_ID, this.identities);
  }

  async findAll(patientId?: string): Promise<Prescription[]> {
    return (await this.repo()).findAll(patientId);
  }

  async findById(id: string): Promise<PrescriptionDetail | null> {
    return (await this.repo()).findById(id);
  }
}

class LazyOscarImmunizationRepository implements ImmunizationRepository {
  private readonly identities = new PrismaPatientClinicIdentityStore();

  private async repo(): Promise<OscarImmunizationRepository> {
    return new OscarImmunizationRepository(await getOscarClient(), OSCAR_CLINIC_ID, this.identities);
  }

  async findAll(patientId?: string): Promise<Vaccination[]> {
    return (await this.repo()).findAll(patientId);
  }

  async findById(id: string): Promise<VaccinationDetail | null> {
    return (await this.repo()).findById(id);
  }
}

class LazyOscarHealthConditionRepository implements HealthConditionRepository {
  private readonly identities = new PrismaPatientClinicIdentityStore();

  private async repo(): Promise<OscarHealthConditionRepository> {
    return new OscarHealthConditionRepository(await getOscarClient(), OSCAR_CLINIC_ID, this.identities);
  }

  async findAll(patientId?: string): Promise<HealthRecordEntry[]> {
    return (await this.repo()).findAll(patientId);
  }

  async findById(id: string, kind: HealthRecordKind): Promise<HealthRecordDetail | null> {
    return (await this.repo()).findById(id, kind);
  }
}

class LazyOscarTestResultRepository implements TestResultRepository {
  private readonly identities = new PrismaPatientClinicIdentityStore();

  private async repo(): Promise<OscarTestResultRepository> {
    return new OscarTestResultRepository(await getOscarClient(), OSCAR_CLINIC_ID, this.identities);
  }

  async findAll(patientId?: string): Promise<LabResult[]> {
    return (await this.repo()).findAll(patientId);
  }

  async findById(id: string): Promise<LabResultDetail | null> {
    return (await this.repo()).findById(id);
  }
}

class LazyOscarDocumentRepository implements DocumentRepository {
  private readonly repo = new OscarDocumentRepository();

  async findAll(patientId?: string): Promise<DocumentRecord[]> {
    return this.repo.findAll(patientId);
  }

  async findById(id: string): Promise<DocumentDetail | null> {
    return this.repo.findById(id);
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
    prescriptions: new LazyOscarPrescriptionRepository(),
    immunizations: new LazyOscarImmunizationRepository(),
    healthConditions: new LazyOscarHealthConditionRepository(),
    testResults: new LazyOscarTestResultRepository(),
    // OscarDocumentRepository needs no OscarClient (always throws — no
    // verified endpoint), so no lazy wrapper needed here.
    documents: new LazyOscarDocumentRepository(),
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
