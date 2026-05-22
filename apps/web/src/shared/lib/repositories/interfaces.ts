import type {
  Appointment,
  Doctor,
  Patient,
} from '@/shared/types';
import type { CreateAppointmentInput } from '@/shared/lib/validators/schemas';

export interface PatientRepository {
  findAll(): Promise<Patient[]>;
  findById(id: string): Promise<Patient | null>;
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
}

export interface MedicalRepositories {
  patients: PatientRepository;
  doctors: DoctorRepository;
  appointments: AppointmentRepository;
}
