import { randomUUID } from 'node:crypto';
import type {
  Appointment,
  Doctor,
  Patient,
} from '@/shared/types';
import type { CreateAppointmentInput } from '@/shared/lib/validators/schemas';
import { isSameDay } from '@/shared/utils';
import {
  createMockDataStore,
  type MockDataStore,
} from '@/shared/lib/mock-data';
import type {
  AppointmentRepository,
  DoctorRepository,
  MedicalRepositories,
  PatientRepository,
} from '@/shared/lib/repositories';

class JsonPatientRepository implements PatientRepository {
  constructor(private readonly store: MockDataStore) {}

  findAll(): Promise<Patient[]> {
    return Promise.resolve([...this.store.patients]);
  }

  findById(id: string): Promise<Patient | null> {
    const patient = this.store.patients.find((item) => item.id === id) ?? null;
    return Promise.resolve(patient);
  }
}

class JsonDoctorRepository implements DoctorRepository {
  constructor(private readonly store: MockDataStore) {}

  findAll(): Promise<Doctor[]> {
    return Promise.resolve([...this.store.doctors]);
  }

  findById(id: string): Promise<Doctor | null> {
    const doctor = this.store.doctors.find((item) => item.id === id) ?? null;
    return Promise.resolve(doctor);
  }
}

class JsonAppointmentRepository implements AppointmentRepository {
  constructor(private readonly store: MockDataStore) {}

  findAll(filters?: {
    patientId?: string;
    doctorId?: string;
    date?: string;
  }): Promise<Appointment[]> {
    let results = [...this.store.appointments];

    if (filters?.patientId) {
      results = results.filter((item) => item.patientId === filters.patientId);
    }

    if (filters?.doctorId) {
      results = results.filter((item) => item.doctorId === filters.doctorId);
    }

    if (filters?.date) {
      results = results.filter((item) =>
        isSameDay(item.scheduledAt, filters.date as string)
      );
    }

    return Promise.resolve(results);
  }

  findById(id: string): Promise<Appointment | null> {
    const appointment =
      this.store.appointments.find((item) => item.id === id) ?? null;
    return Promise.resolve(appointment);
  }

  async create(input: CreateAppointmentInput): Promise<Appointment> {
    const patientRepo = new JsonPatientRepository(this.store);
    const doctorRepo = new JsonDoctorRepository(this.store);

    const [patient, doctor] = await Promise.all([
      patientRepo.findById(input.patientId),
      doctorRepo.findById(input.doctorId),
    ]);

    if (!patient) {
      throw new Error('Patient not found');
    }

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    const appointment: Appointment = {
      id: randomUUID(),
      patientId: input.patientId,
      doctorId: input.doctorId,
      scheduledAt: input.scheduledAt,
      durationMinutes: input.durationMinutes,
      status: 'scheduled',
      reason: input.reason,
      notes: input.notes ?? null,
      createdAt: new Date().toISOString(),
    };

    this.store.appointments.push(appointment);
    return appointment;
  }
}

let cachedRepositories: MedicalRepositories | null = null;

export function createMockRepositories(): MedicalRepositories {
  const store = createMockDataStore();

  return {
    patients: new JsonPatientRepository(store),
    doctors: new JsonDoctorRepository(store),
    appointments: new JsonAppointmentRepository(store),
  };
}

export function getMockRepositories(): MedicalRepositories {
  if (!cachedRepositories) {
    cachedRepositories = createMockRepositories();
  }

  return cachedRepositories;
}

export function resetMockRepositories(): void {
  cachedRepositories = createMockRepositories();
}
