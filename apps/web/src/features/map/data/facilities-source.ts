import { PrismaFacilityRepository } from '@/lib/facilities/repository';
import type { MapFacility } from '../types';

const facilityRepository = new PrismaFacilityRepository();

/**
 * Facilities are platform-owned data in our own database — independent of
 * DATA_SOURCE/EMR type (see docs/oscar/new-approach/docs-oscar-new-approach.md
 * decision #2). No FHIR/mock branching here anymore.
 */
export async function loadFacilities(): Promise<MapFacility[]> {
  return facilityRepository.findAll();
}
