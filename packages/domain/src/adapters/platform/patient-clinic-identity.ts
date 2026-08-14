import 'server-only';
import { prisma } from '@medical-platform/db';
import type { PatientClinicIdentityStore } from '../../ports/patient-clinic-identity';

export class PrismaPatientClinicIdentityStore implements PatientClinicIdentityStore {
  async find(patientId: string, clinicId: string): Promise<{ externalPatientId: string } | null> {
    const row = await prisma.patientClinicIdentity.findUnique({
      where: { patientId_clinicId: { patientId, clinicId } },
    });

    return row ? { externalPatientId: row.externalPatientId } : null;
  }

  async create(input: {
    patientId: string;
    clinicId: string;
    externalPatientId: string;
    healthNumber: string;
  }): Promise<{ externalPatientId: string }> {
    // Upsert so a concurrent request racing this one can't violate the
    // (patientId, clinicId) unique constraint — the existing row always wins.
    const row = await prisma.patientClinicIdentity.upsert({
      where: { patientId_clinicId: { patientId: input.patientId, clinicId: input.clinicId } },
      create: {
        patientId: input.patientId,
        clinicId: input.clinicId,
        externalPatientId: input.externalPatientId,
        healthNumber: input.healthNumber,
      },
      update: {},
    });

    return { externalPatientId: row.externalPatientId };
  }
}
