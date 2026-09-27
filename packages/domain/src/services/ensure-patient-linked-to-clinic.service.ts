import { createOscarDemographic } from '../adapters/oscar/oscar-demographic-provisioner';
import { searchDemographicByName } from '../adapters/oscar/oscar-demographic-soap-service';
import type { OscarClient } from '../adapters/oscar/oscar-client';
import type { OscarSoapClient } from '../adapters/oscar/oscar-soap-client';
import type { OscarSoapDemographicSearchResult } from '../adapters/oscar/oscar-soap-types';
import type { PatientClinicIdentityStore } from '../ports/patient-clinic-identity';
import type { PatientRepository } from '../ports/repositories';

export interface EnsurePatientLinkedToClinicOptions {
  /**
   * `false` right after registration (search-only, no clinic/doctor context
   * yet — a miss is not an error). `true` at booking time, when a specific
   * doctor's clinic is known and a miss means "provision this patient here".
   */
  allowCreate: boolean;
  /** Required when `allowCreate` is true — the doctor being booked, added to the new patient's doctor list on create. */
  targetProviderNo?: string;
}

export type EnsurePatientLinkedToClinicResult =
  | { status: 'already_linked'; externalPatientId: string }
  | { status: 'linked'; externalPatientId: string }
  | { status: 'created'; externalPatientId: string }
  | { status: 'not_found' }
  | { status: 'incomplete_profile' }
  | { status: 'ambiguous_match' };

/** Thrown by callers (e.g. OscarAppointmentRepository.create) when `ensure()` can't produce a usable link — `reason` lets the UI branch (redirect to profile vs. "contact the clinic" message). */
export class PatientNotLinkableError extends Error {
  constructor(public readonly reason: 'incomplete_profile' | 'ambiguous_match') {
    super(
      reason === 'incomplete_profile'
        ? 'Patient profile is missing required fields (name and/or date of birth).'
        : 'Multiple matching patient records were found at this clinic.'
    );
    this.name = 'PatientNotLinkableError';
  }
}

function namesMatch(a: string, b: string): boolean {
  return a.trim().localeCompare(b.trim(), undefined, { sensitivity: 'base' }) === 0;
}

/**
 * Establishes patientId+clinicId → externalPatientId (OSCAR demographicNo).
 * Matching is by firstName+lastName (OSCAR search has no HIN-search
 * endpoint, and the project owner considers full name a reliable-enough
 * identifier in this clinic's jurisdiction) — HIN is only ever used to seed
 * a *new* record, never to search. Idempotent: an existing link short-
 * circuits before any EMR call. See
 * docs/oscar/new-approach/patient-clinic-linking-architecture.md and
 * oscar-verified-service-catalog.md.
 */
export class EnsurePatientLinkedToClinicUseCase {
  constructor(
    private readonly identities: PatientClinicIdentityStore,
    private readonly patients: PatientRepository,
    private readonly soapClient: OscarSoapClient,
    private readonly restClient: OscarClient
  ) {}

  async ensure(
    patientId: string,
    clinicId: string,
    options: EnsurePatientLinkedToClinicOptions
  ): Promise<EnsurePatientLinkedToClinicResult> {
    const existing = await this.identities.find(patientId, clinicId);

    if (existing) {
      return { status: 'already_linked', externalPatientId: existing.externalPatientId };
    }

    const patient = await this.patients.findById(patientId);

    if (!patient || !patient.firstName.trim() || !patient.lastName.trim()) {
      return { status: 'incomplete_profile' };
    }

    if (options.allowCreate && !patient.dateOfBirth) {
      // A real DOB is required to provision a new OSCAR record — booking
      // can't proceed without it, even though DOB isn't required to search.
      return { status: 'incomplete_profile' };
    }

    const candidates = await searchDemographicByName(this.soapClient, patient.lastName);
    const activeMatches = candidates.filter(
      (candidate): candidate is OscarSoapDemographicSearchResult & { firstName: string } =>
        Boolean(
          candidate.firstName &&
            namesMatch(candidate.firstName, patient.firstName) &&
            candidate.patientStatus !== 'DE'
        )
    );

    if (activeMatches.length === 1) {
      const identity = await this.identities.create({
        patientId,
        clinicId,
        externalPatientId: String(activeMatches[0].demographicNo),
        healthNumber: patient.healthNumber ?? '',
      });

      return { status: 'linked', externalPatientId: identity.externalPatientId };
    }

    if (activeMatches.length > 1) {
      // Multiple active patients with the same name — don't guess which one
      // is really this person, and don't risk creating a duplicate either.
      return { status: 'ambiguous_match' };
    }

    if (!options.allowCreate) {
      return { status: 'not_found' };
    }

    if (!options.targetProviderNo) {
      throw new Error('EnsurePatientLinkedToClinicUseCase: targetProviderNo is required when allowCreate is true.');
    }

    // patient.dateOfBirth is guaranteed non-null here (checked above).
    const created = await createOscarDemographic(this.restClient, {
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth as string,
      healthNumber: patient.healthNumber,
      email: patient.email,
      phone: patient.phone,
      addressLine: patient.addressLine,
      city: patient.city,
      province: patient.province,
      postalCode: patient.postalCode,
      targetProviderNo: options.targetProviderNo,
    });

    const identity = await this.identities.create({
      patientId,
      clinicId,
      externalPatientId: created.demographicNo,
      healthNumber: patient.healthNumber ?? '',
    });

    return { status: 'created', externalPatientId: identity.externalPatientId };
  }
}
