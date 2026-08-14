import { randomUUID } from 'node:crypto';
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
} from '../../types/health-records';
import { formatFullName, isSameDay, normalizePhone } from '../../utils/helpers';
import {
  createMockDataStore,
  type MockDataStore,
} from './mock-data/index';
import type {
  AppointmentRepository,
  DoctorRepository,
  DocumentRepository,
  HealthConditionRepository,
  ImmunizationRepository,
  MedicalRepositories,
  PatientRepository,
  PrescriptionRepository,
  TestResultRepository,
} from '../../ports/repositories';

class JsonPatientRepository implements PatientRepository {
  constructor(private readonly store: MockDataStore) {}

  findAll(): Promise<Patient[]> {
    return Promise.resolve([...this.store.patients]);
  }

  findById(id: string): Promise<Patient | null> {
    const patient = this.store.patients.find((item) => item.id === id) ?? null;
    return Promise.resolve(patient);
  }

  findByPhone(phone: string): Promise<Patient | null> {
    const normalizedPhone = normalizePhone(phone);
    const patient =
      this.store.patients.find(
        (item) => normalizePhone(item.phone) === normalizedPhone
      ) ?? null;

    return Promise.resolve(patient);
  }

  create(input: CreatePatientInput): Promise<Patient> {
    const patient: Patient = {
      id: randomUUID(),
      firstName: input.firstName,
      lastName: input.lastName,
      dateOfBirth: input.dateOfBirth,
      email: input.email,
      phone: input.phone,
      createdAt: new Date().toISOString(),
    };

    this.store.patients.push(patient);
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

  findDetailById(id: string): Promise<AppointmentDetail | null> {
    const appointment = this.store.appointments.find((item) => item.id === id);

    if (!appointment) {
      return Promise.resolve(null);
    }

    const patient = this.store.patients.find((item) => item.id === appointment.patientId);
    const doctor = this.store.doctors.find((item) => item.id === appointment.doctorId);

    return Promise.resolve({
      id: appointment.id,
      status: appointment.status,
      scheduledAt: appointment.scheduledAt,
      durationMinutes: appointment.durationMinutes,
      reason: appointment.reason,
      comment: appointment.notes ?? undefined,
      created: appointment.createdAt,
      patientName: patient ? formatFullName(patient.firstName, patient.lastName) : undefined,
      doctor: doctor
        ? {
            id: doctor.id,
            name: formatFullName(doctor.firstName, doctor.lastName),
            specialty: doctor.specialty,
            phone: doctor.phone || undefined,
          }
        : undefined,
      // No location: the mock dataset has no facility linkage, matching the
      // same gap OSCAR-sourced appointments currently have.
    });
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

  updateStatus(
    id: string,
    status: AppointmentStatus
  ): Promise<Appointment | null> {
    const appointment =
      this.store.appointments.find((item) => item.id === id) ?? null;

    if (appointment) {
      appointment.status = status;
    }

    return Promise.resolve(appointment);
  }
}

// Moved from apps/web/src/features/health-records/data/*-source.ts inline
// arrays (see docs/oscar/new-approach/docs-oscar-new-approach.md §1) —
// ported as-is, including the `'mock-patient'` literal patientId, to
// preserve exact current behavior.

const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'mock-med-1',
    medication: 'Atorvastatin 20mg tablet',
    status: 'active',
    authoredOn: '2026-06-22',
    dosageInstructions: ['1 tablet once daily at night'],
    patientId: 'mock-patient',
  },
  {
    id: 'mock-med-2',
    medication: 'Metformin 500mg tablet',
    status: 'active',
    authoredOn: '2026-06-20',
    dosageInstructions: ['1 tablet twice daily with meals'],
    patientId: 'mock-patient',
  },
];

class JsonPrescriptionRepository implements PrescriptionRepository {
  findAll(patientId?: string): Promise<Prescription[]> {
    const results = patientId
      ? MOCK_PRESCRIPTIONS.filter((item) => item.patientId === patientId)
      : MOCK_PRESCRIPTIONS;

    return Promise.resolve(
      [...results].sort((a, b) => (b.authoredOn ?? '').localeCompare(a.authoredOn ?? ''))
    );
  }

  findById(id: string): Promise<PrescriptionDetail | null> {
    const prescription = MOCK_PRESCRIPTIONS.find((item) => item.id === id);

    if (!prescription) {
      return Promise.resolve(null);
    }

    return Promise.resolve({ ...prescription, dispenses: [] });
  }
}

const MOCK_VACCINATIONS: Vaccination[] = [
  {
    id: 'mock-imm-1',
    name: 'COVID-19 mRNA (Comirnaty)',
    status: 'completed',
    date: '2025-10-15',
    doseNumber: 3,
    seriesDoses: 3,
    patientId: 'mock-patient',
  },
];

class JsonImmunizationRepository implements ImmunizationRepository {
  findAll(patientId?: string): Promise<Vaccination[]> {
    const results = patientId
      ? MOCK_VACCINATIONS.filter((item) => item.patientId === patientId)
      : MOCK_VACCINATIONS;

    return Promise.resolve([...results].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')));
  }

  findById(id: string): Promise<VaccinationDetail | null> {
    const vaccination = MOCK_VACCINATIONS.find((item) => item.id === id);

    if (!vaccination) {
      return Promise.resolve(null);
    }

    return Promise.resolve({ ...vaccination, targetDiseases: [] });
  }
}

const MOCK_HEALTH_RECORD_ENTRIES: HealthRecordEntry[] = [
  {
    id: 'mock-cond-1',
    kind: 'condition',
    name: 'Essential hypertension',
    clinicalStatus: 'Active',
    tag: 'Moderate',
    recordedDate: '2023-02-15',
    patientId: 'mock-patient',
  },
  {
    id: 'mock-allergy-1',
    kind: 'allergy',
    name: 'Penicillin',
    clinicalStatus: 'Active',
    tag: 'high risk',
    recordedDate: '2015-06-03',
    patientId: 'mock-patient',
  },
];

class JsonHealthConditionRepository implements HealthConditionRepository {
  findAll(patientId?: string): Promise<HealthRecordEntry[]> {
    const results = patientId
      ? MOCK_HEALTH_RECORD_ENTRIES.filter((item) => item.patientId === patientId)
      : MOCK_HEALTH_RECORD_ENTRIES;

    return Promise.resolve(
      [...results].sort((a, b) => (b.recordedDate ?? '').localeCompare(a.recordedDate ?? ''))
    );
  }

  findById(id: string, kind: HealthRecordKind): Promise<HealthRecordDetail | null> {
    const entry = MOCK_HEALTH_RECORD_ENTRIES.find((item) => item.id === id && item.kind === kind);

    if (!entry) {
      return Promise.resolve(null);
    }

    if (entry.kind === 'allergy') {
      return Promise.resolve({
        id: entry.id,
        kind: 'allergy',
        name: entry.name,
        categories: [],
        criticality: entry.tag,
        clinicalStatus: entry.clinicalStatus,
        recordedDate: entry.recordedDate,
        reactions: [],
        patientId: entry.patientId,
      });
    }

    return Promise.resolve({
      id: entry.id,
      kind: 'condition',
      name: entry.name,
      clinicalStatus: entry.clinicalStatus,
      severity: entry.tag,
      recordedDate: entry.recordedDate,
      patientId: entry.patientId,
    });
  }
}

const MOCK_LAB_RESULTS: LabResult[] = [
  {
    id: 'mock-obs-1',
    name: 'Blood pressure',
    status: 'final',
    effectiveDate: '2026-06-22T10:05:00-04:00',
    values: [
      { label: 'Systolic', value: '128 mmHg' },
      { label: 'Diastolic', value: '82 mmHg' },
    ],
    patientId: 'mock-patient',
  },
  {
    id: 'mock-obs-2',
    name: 'Blood glucose',
    status: 'final',
    effectiveDate: '2026-06-20T09:00:00-04:00',
    values: [{ value: '142 mg/dL' }],
    patientId: 'mock-patient',
  },
];

class JsonTestResultRepository implements TestResultRepository {
  findAll(patientId?: string): Promise<LabResult[]> {
    const results = patientId
      ? MOCK_LAB_RESULTS.filter((item) => item.patientId === patientId)
      : MOCK_LAB_RESULTS;

    return Promise.resolve(
      [...results].sort((a, b) => (b.effectiveDate ?? '').localeCompare(a.effectiveDate ?? ''))
    );
  }

  findById(id: string): Promise<LabResultDetail | null> {
    const result = MOCK_LAB_RESULTS.find((item) => item.id === id);

    if (!result) {
      return Promise.resolve(null);
    }

    return Promise.resolve({
      ...result,
      values: result.values.map((value) => ({ ...value })),
    });
  }
}

const MOCK_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'mock-doc-1',
    title: 'Discharge summary - May 2026.pdf',
    type: 'Discharge summary',
    date: '2026-05-10T16:00:00-04:00',
    patientId: 'mock-patient',
  },
];

class JsonDocumentRepository implements DocumentRepository {
  findAll(patientId?: string): Promise<DocumentRecord[]> {
    const results = patientId
      ? MOCK_DOCUMENTS.filter((item) => item.patientId === patientId)
      : MOCK_DOCUMENTS;

    return Promise.resolve([...results].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')));
  }

  findById(id: string): Promise<DocumentDetail | null> {
    const document = MOCK_DOCUMENTS.find((item) => item.id === id);
    return Promise.resolve(document ? { ...document } : null);
  }
}

let cachedRepositories: MedicalRepositories | null = null;

export function createMockRepositories(): MedicalRepositories {
  const store = createMockDataStore();

  return {
    patients: new JsonPatientRepository(store),
    doctors: new JsonDoctorRepository(store),
    appointments: new JsonAppointmentRepository(store),
    prescriptions: new JsonPrescriptionRepository(),
    immunizations: new JsonImmunizationRepository(),
    healthConditions: new JsonHealthConditionRepository(),
    testResults: new JsonTestResultRepository(),
    documents: new JsonDocumentRepository(),
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
