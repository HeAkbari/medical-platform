import 'server-only';
import { prisma } from '@medical-platform/db';
import type { Doctor } from '@medical-platform/domain';

export interface DoctorDirectoryRepository {
  findAll(): Promise<Doctor[]>;
  findById(id: string): Promise<Doctor | null>;
}

interface DoctorRow {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  email: string;
  phone: string;
  clinicName: string | null;
  createdAt: Date;
  reviews: { rating: number }[];
}

function toDomainDoctor(row: DoctorRow): Doctor {
  const reviewCount = row.reviews.length;
  const averageRating =
    reviewCount > 0
      ? row.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : undefined;

  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    specialty: row.specialty,
    email: row.email,
    phone: row.phone,
    createdAt: row.createdAt.toISOString(),
    clinicName: row.clinicName ?? undefined,
    averageRating,
    reviewCount: reviewCount > 0 ? reviewCount : undefined,
  };
}

/**
 * Doctor directory browsing (Find Physician, Physician Info, rating) reads
 * only from our own database — never live from an EMR. Populated by a
 * periodic sync job (scripts/sync-doctors.ts), not switched by DATA_SOURCE.
 * Availability/booking stays fully live via the existing
 * MedicalRepositories.appointments. See design doc §5.
 */
export class PrismaDoctorDirectoryRepository implements DoctorDirectoryRepository {
  async findAll(): Promise<Doctor[]> {
    const rows = await prisma.doctor.findMany({
      include: { reviews: { select: { rating: true } } },
      orderBy: { lastName: 'asc' },
    });

    return rows.map(toDomainDoctor);
  }

  async findById(id: string): Promise<Doctor | null> {
    const row = await prisma.doctor.findUnique({
      where: { id },
      include: { reviews: { select: { rating: true } } },
    });

    return row ? toDomainDoctor(row) : null;
  }
}
