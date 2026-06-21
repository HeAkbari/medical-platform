import {
  createFhirRepositories,
  getMockRepositories,
  type MedicalRepositories,
} from '@medical-platform/domain';

/**
 * Single source of truth for the data layer, shared by every server module
 * (API services AND phone auth). Resolving this in one place keeps the
 * logged-in patient identity consistent with the data the app reads/writes:
 *
 * - `mock`  (default): in-memory JSON repositories.
 * - `fhir`: FHIR R4 server (HAPI locally, OSCAR sandbox/prod later).
 */
function resolveRepositories(): MedicalRepositories {
  if (process.env.DATA_SOURCE === 'fhir') {
    return createFhirRepositories({
      baseUrl: process.env.FHIR_BASE_URL ?? 'http://localhost:8080/fhir',
      token: process.env.FHIR_TOKEN,
    });
  }

  return getMockRepositories();
}

export const repositories = resolveRepositories();
