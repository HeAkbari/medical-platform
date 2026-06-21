import type {
  Appointment,
  AppointmentStatus,
  Doctor,
  Patient,
} from '../types/models';
import type {
  CreateAppointmentInput,
  CreatePatientInput,
} from '../validation/schemas';

export interface PatientRepository {
  findAll(): Promise<Patient[]>;
  findById(id: string): Promise<Patient | null>;
  findByPhone(phone: string): Promise<Patient | null>;
  create(input: CreatePatientInput): Promise<Patient>;
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
  create(input: CreateAppointmentInput): Promise<Appointment>;
  updateStatus(
    id: string,
    status: AppointmentStatus
  ): Promise<Appointment | null>;
}

export interface MedicalRepositories {
  patients: PatientRepository;
  doctors: DoctorRepository;
  appointments: AppointmentRepository;
}
