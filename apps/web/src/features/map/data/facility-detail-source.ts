import { PrismaFacilityRepository } from '@/lib/facilities/repository';
import type { FacilityDetail } from './facility-detail';

const facilityRepository = new PrismaFacilityRepository();

/**
 * Facilities are platform-owned data in our own database — independent of
 * DATA_SOURCE/EMR type (see docs/oscar/new-approach/docs-oscar-new-approach.md
 * decision #2). No FHIR/mock branching here anymore.
 */
export async function loadFacilityDetail(id: string): Promise<FacilityDetail | null> {
  return facilityRepository.findById(id);
}
