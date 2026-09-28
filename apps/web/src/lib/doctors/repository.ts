import 'server-only';
import { prisma } from '@medical-platform/db';
import type {
  Doctor,
  DoctorClinicAddress,
  DoctorReview,
  DoctorWorkingHours,
} from '@medical-platform/domain';
import type { MapFacility } from '@/features/map/types';
import { fetchLiveDoctorInfo } from '@/lib/doctors/live-doctor-info';

export interface DoctorDirectoryRepository {
  findAll(): Promise<Doctor[]>;
  findById(id: string): Promise<Doctor | null>;
}

interface DoctorRow {
  id: string;
  clinicId: string;
  externalProviderId: string;
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
 * Doctor directory browsing (`findAll` — Find Physician list) reads only
 * from our own database, populated by a periodic sync job
 * (scripts/sync-doctors.ts), not switched by DATA_SOURCE. See design doc §5.
 *
 * `findById` (single-doctor detail page) starts from that same DB row, then
 * best-effort freshens phone/email/specialty/clinicAddress/workingHours
 * with a live OSCAR read when DATA_SOURCE=oscar (see live-doctor-info.ts) —
 * the DB row/Facility placeholder is the fallback, not the source of truth,
 * for a single detail view. Availability/booking stays fully live via the
 * existing MedicalRepositories.appointments, unrelated to this file.
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

    const doctor = toDomainDoctorDetail({ ...row, reviews }, clinicInfo);

    // Detail view only (never the list) — freshen with a live OSCAR read
    // instead of relying solely on the periodic sync/Facility placeholder.
    // Best-effort: falls back to what we already have on any failure.
    if (process.env.DATA_SOURCE === 'oscar') {
      const live = await fetchLiveDoctorInfo(row.externalProviderId);

      if (live) {
        return {
          ...doctor,
          phone: live.phone || doctor.phone,
          email: live.email || doctor.email,
          specialty: live.specialty || doctor.specialty,
          clinicAddress: live.clinicAddress ?? doctor.clinicAddress,
          workingHours: live.workingHours ?? doctor.workingHours,
        };
      }
    }

    return doctor;
  }
}
