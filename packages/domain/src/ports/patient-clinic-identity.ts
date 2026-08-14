/**
 * Persistence for the patientId+clinicId → externalPatientId mapping
 * (`PatientClinicIdentity`). Platform-owned data — one implementation
 * (Prisma-backed) regardless of which EMR the clinic runs, so this isn't
 * switched by `DATA_SOURCE` the way `MedicalRepositories` is.
 */
export interface PatientClinicIdentityStore {
  find(patientId: string, clinicId: string): Promise<{ externalPatientId: string } | null>;
  /**
   * Upsert semantics: if a link already exists for (patientId, clinicId) —
   * e.g. a concurrent request raced this one — the existing row wins and is
   * returned as-is, never overwritten with a new match result.
   */
  create(input: {
    patientId: string;
    clinicId: string;
    externalPatientId: string;
    healthNumber: string;
  }): Promise<{ externalPatientId: string }>;
}
