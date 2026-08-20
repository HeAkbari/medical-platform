import 'server-only';
import { prisma } from '@medical-platform/db';
import type {
  Doctor,
  DoctorClinicAddress,
  DoctorReview,
  DoctorWorkingHours,
} from '@medical-platform/domain';
import type { MapFacility } from '@/features/map/types';

export interface DoctorDirectoryRepository {
  findAll(): Promise<Doctor[]>;
  findById(id: string): Promise<Doctor | null>;
}

interface DoctorRow {
  id: string;
  clinicId: string;
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

interface DoctorDetailRow extends DoctorRow {
  reviews: DoctorReview[];
}

/** Populated only for `findById` (see class doc) — a live join against
 * whichever Facility row is linked to this doctor's clinic, if any. */
interface ClinicInfo {
  clinicAddress?: DoctorClinicAddress;
  workingHours?: DoctorWorkingHours;
  languages?: string[];
}

async function resolveClinicInfo(clinicId: string): Promise<ClinicInfo> {
  const facilityRow = await prisma.facility.findUnique({ where: { clinicId } });

  if (!facilityRow) {
    return {};
  }

  const facility = facilityRow.data as unknown as MapFacility;

  return {
    clinicAddress: facility.address,
    workingHours: facility.hours,
    languages: facility.languages,
  };
}

function toDomainDoctorDetail(row: DoctorDetailRow, clinicInfo: ClinicInfo): Doctor {
  return {
    ...toDomainDoctor(row),
    reviews: row.reviews,
    ...clinicInfo,
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
      include: {
        reviews: { select: { rating: true, comment: true, authorName: true, createdAt: true } },
      },
    });

    if (!row) {
      return null;
    }

    const clinicInfo = await resolveClinicInfo(row.clinicId);
    const reviews: DoctorReview[] = row.reviews.map((review) => ({
      rating: review.rating,
      comment: review.comment ?? undefined,
      authorName: review.authorName ?? undefined,
      createdAt: review.createdAt.toISOString(),
    }));

    return toDomainDoctorDetail({ ...row, reviews }, clinicInfo);
  }
}
