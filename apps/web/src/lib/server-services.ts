import {
  AppointmentService,
  createFhirRepositories,
  DoctorService,
  getMockRepositories,
  PatientService,
  type MedicalRepositories,
} from '@medical-platform/domain';

/**
 * Data source selection.
 *
 * - `mock`  (default): in-memory JSON repositories — no external dependency.
 * - `fhir`: FHIR R4 server (HAPI locally for phase 1, OSCAR sandbox/prod later).
 *
 * Switch with DATA_SOURCE=fhir and point FHIR_BASE_URL at the server.
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

const repositories = resolveRepositories();

export const patientService = new PatientService(repositories.patients);
export const doctorService = new DoctorService(repositories.doctors);
export const appointmentService = new AppointmentService(
  repositories.appointments
);
