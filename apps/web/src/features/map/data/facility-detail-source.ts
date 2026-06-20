import {
  FhirClient,
  type FhirHealthcareService,
  type FhirLocation,
  type FhirOrganization,
  type FhirPractitioner,
  type FhirPractitionerRole,
  type FhirResource,
} from '@medical-platform/domain';
import type { FacilityDetail } from './facility-detail';
import { buildFacilityDetail } from './fhir-facility-detail-mapper';
import { MOCK_MAP_FACILITIES } from './mock-facilities';

/**
 * Loads the full FHIR-native detail for one facility by aggregating the
 * Location with its HealthcareService, PractitionerRole, Practitioner and
 * Organization resources (resolved via FHIR `_include`).
 */
export async function loadFacilityDetail(
  id: string
): Promise<FacilityDetail | null> {
  if (process.env.DATA_SOURCE === 'fhir') {
    const client = new FhirClient({
      baseUrl: process.env.FHIR_BASE_URL ?? 'http://localhost:8080/fhir',
      token: process.env.FHIR_TOKEN,
    });

    const location = await client.read<FhirLocation>('Location', id);
    if (!location) {
      return null;
    }

    const [serviceResources, roleResources] = await Promise.all([
      client.search<FhirResource>('HealthcareService', {
        location: `Location/${id}`,
        _include: 'HealthcareService:organization',
      }),
      client.search<FhirResource>('PractitionerRole', {
        location: `Location/${id}`,
        _include: 'PractitionerRole:practitioner',
      }),
    ]);

    return buildFacilityDetail({
      location,
      services: serviceResources.filter(
        (resource): resource is FhirHealthcareService =>
          resource.resourceType === 'HealthcareService'
      ),
      organizations: serviceResources.filter(
        (resource): resource is FhirOrganization =>
          resource.resourceType === 'Organization'
      ),
      roles: roleResources.filter(
        (resource): resource is FhirPractitionerRole =>
          resource.resourceType === 'PractitionerRole'
      ),
      practitioners: roleResources.filter(
        (resource): resource is FhirPractitioner =>
          resource.resourceType === 'Practitioner'
      ),
    });
  }

  // Mock mode: surface what the lightweight mock facility knows.
  const facility = MOCK_MAP_FACILITIES.find((item) => item.id === id);
  if (!facility) {
    return null;
  }

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
    source: 'mock',
  };
}
