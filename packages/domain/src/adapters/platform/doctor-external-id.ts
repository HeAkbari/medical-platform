import 'server-only';
import { prisma } from '@medical-platform/db';
import type { DoctorExternalIdResolver } from '../../ports/doctor-external-id';

export class PrismaDoctorExternalIdResolver implements DoctorExternalIdResolver {
  async resolve(doctorId: string): Promise<{ clinicId: string; externalProviderId: string } | null> {
    const row = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { clinicId: true, externalProviderId: true },
    });

    return row ? { clinicId: row.clinicId, externalProviderId: row.externalProviderId } : null;
  }
}
