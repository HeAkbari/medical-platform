import { FhirClient, type FhirLocation } from '@medical-platform/domain';
import type { MapFacility } from '../types';
import { fhirLocationToFacility } from './fhir-facility-mapper';
import { MOCK_MAP_FACILITIES } from './mock-facilities';

/**
 * Server-side facility source. Mirrors the DATA_SOURCE toggle used by the other
 * repositories: `fhir` reads `Location` resources from the FHIR server (HAPI now,
 * OSCAR sandbox later), anything else returns the in-memory mock facilities.
 */
export async function loadFacilities(): Promise<MapFacility[]> {
  if (process.env.DATA_SOURCE === 'fhir') {
    const client = new FhirClient({
      baseUrl: process.env.FHIR_BASE_URL ?? 'http://localhost:8080/fhir',
      token: process.env.FHIR_TOKEN,
    });

    const locations = await client.search<FhirLocation>('Location', {
      status: 'active',
    });
    return locations.map(fhirLocationToFacility);
  }

  return MOCK_MAP_FACILITIES;
}
