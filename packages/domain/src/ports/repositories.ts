import type {
  Appointment,
  AppointmentDetail,
  AppointmentStatus,
  Doctor,
  Patient,
} from '../types/models';
import type {
  DocumentDetail,
  DocumentRecord,
  HealthRecordDetail,
  HealthRecordEntry,
  HealthRecordKind,
  LabResult,
  LabResultDetail,
  Prescription,
  PrescriptionDetail,
  Vaccination,
  VaccinationDetail,
} from '../types/health-records';
import type {
  CreateAppointmentInput,
  CreatePatientInput,
  UpdatePatientInput,
} from '../validation/schemas';

export interface PatientRepository {
  findAll(): Promise<Patient[]>;
  findById(id: string): Promise<Patient | null>;
  findByPhone(phone: string): Promise<Patient | null>;
  create(input: CreatePatientInput): Promise<Patient>;
  update(id: string, input: UpdatePatientInput): Promise<Patient>;
}

export interface DoctorRepository {
  findAll(): Promise<Doctor[]>;
  findById(id: string): Promise<Doctor | null>;
}

export interface AppointmentRepository {
  findAll(filters?: {
    patientId?: string;
    doctorId?: string;
    date?: string;
  }): Promise<Appointment[]>;
  findById(id: string): Promise<Appointment | null>;
  findDetailById(id: string): Promise<AppointmentDetail | null>;
  create(input: CreateAppointmentInput): Promise<Appointment>;
  updateStatus(
    id: string,
    status: AppointmentStatus
  ): Promise<Appointment | null>;
}

export interface PrescriptionRepository {
  findAll(patientId?: string): Promise<Prescription[]>;
  findById(id: string): Promise<PrescriptionDetail | null>;
}

export interface ImmunizationRepository {
  findAll(patientId?: string): Promise<Vaccination[]>;
  findById(id: string): Promise<VaccinationDetail | null>;
}

/**
 * Covers Condition + AllergyIntolerance together (one "health conditions"
 * feature on the frontend) — `kind` discriminates which one findById needs to
 * re-fetch. See docs/oscar/new-approach/docs-oscar-new-approach.md §1: only
 * the 'allergy' kind has a clean OSCAR mapping; 'condition' is a flagged gap.
 */
export interface HealthConditionRepository {
  findAll(patientId?: string): Promise<HealthRecordEntry[]>;
  findById(id: string, kind: HealthRecordKind): Promise<HealthRecordDetail | null>;
}

export interface TestResultRepository {
  findAll(patientId?: string): Promise<LabResult[]>;
  findById(id: string): Promise<LabResultDetail | null>;
}

/**
 * No verified clean OSCAR REST resource exists for documents (see design
 * doc §10) — findAll/findById throw for OSCAR rather than returning a
 * silent empty list indistinguishable from "no documents".
 */
export interface DocumentRepository {
  findAll(patientId?: string): Promise<DocumentRecord[]>;
  findById(id: string): Promise<DocumentDetail | null>;
}

export interface MedicalRepositories {
  patients: PatientRepository;
  doctors: DoctorRepository;
  appointments: AppointmentRepository;
  prescriptions: PrescriptionRepository;
  immunizations: ImmunizationRepository;
  healthConditions: HealthConditionRepository;
  testResults: TestResultRepository;
  documents: DocumentRepository;
}
