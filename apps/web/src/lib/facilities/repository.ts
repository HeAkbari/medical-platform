import 'server-only';
import { prisma } from '@medical-platform/db';
import type { FacilityDetail } from '@/features/map/data/facility-detail';
import type { CoverageBadge, MapFacility } from '@/features/map/types';
import { computeIsOpenNow } from './hours';

export interface FacilityRepository {
  findAll(): Promise<MapFacility[]>;
  findById(id: string): Promise<FacilityDetail | null>;
}

/** isOpenNow (and the 'open-now' badge) is time-dependent — recompute on every
 * read rather than trusting whatever was true when the row was seeded. */
function withComputedOpenNow(facility: MapFacility): MapFacility {
  const isOpenNow = computeIsOpenNow(facility.hours);
  const coverageBadges: CoverageBadge[] = facility.coverageBadges.filter(
    (badge) => badge !== 'open-now'
  );

  if (isOpenNow) {
    coverageBadges.push('open-now');
  }

  return { ...facility, isOpenNow, coverageBadges, source: 'platform' };
}

/**
 * Facilities are platform-owned data — independent of any clinic's EMR type
 * (OSCAR, FHIR, ...), per docs/oscar/new-approach/docs-oscar-new-approach.md
 * decision #2. Not switched by DATA_SOURCE; this is the only implementation.
 */
export class PrismaFacilityRepository implements FacilityRepository {
  async findAll(): Promise<MapFacility[]> {
    const rows = await prisma.facility.findMany({ orderBy: { id: 'asc' } });
    return rows.map((row) => withComputedOpenNow(row.data as unknown as MapFacility));
  }

  async findById(id: string): Promise<FacilityDetail | null> {
    const row = await prisma.facility.findUnique({ where: { id } });

    if (!row) {
      return null;
    }

    const facility = withComputedOpenNow(row.data as unknown as MapFacility);

    // Matches the pre-existing mock-mode fallback shape exactly (empty
    // services/practitioners) — no richer per-facility detail data exists
    // yet to seed this from. See design doc §4.
    return {
      id: facility.id,
      name: facility.name,
      status: 'active',
      category: facility.category,
      superCategory: facility.superCategory,
      subcategory: facility.subcategory,
      address: facility.address,
      position: facility.position,
      phone: facility.phone,
      website: facility.website,
      hours: facility.hours,
      isOpenNow: facility.isOpenNow,
      services: [],
      practitioners: [],
      source: 'platform',
    };
  }
}
