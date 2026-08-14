import type { PatientClinicIdentityStore } from '../ports/patient-clinic-identity';
import type { ClinicPatientMatcher } from '../ports/patient-matching';

export interface LinkPatientToClinicInput {
  patientId: string;
  clinicId: string;
  healthNumber: string;
  dateOfBirth: string;
}

export type LinkPatientToClinicResult =
  | { status: 'linked'; externalPatientId: string }
  | { status: 'already_linked'; externalPatientId: string }
  | { status: 'not_found' }
  | { status: 'invalid_data' }
  | { status: 'unavailable' };

/**
 * Establishes patientId+clinicId → externalPatientId the first time a
 * patient needs clinic/clinical data — never at registration. Idempotent:
 * an existing link short-circuits before any EMR call.
 * See docs/oscar/new-approach/patient-clinic-linking-architecture.md.
 */
export class LinkPatientToClinicUseCase {
  constructor(
    private readonly identities: PatientClinicIdentityStore,
    private readonly matcher: ClinicPatientMatcher
  ) {}

  async execute(input: LinkPatientToClinicInput): Promise<LinkPatientToClinicResult> {
    const existing = await this.identities.find(input.patientId, input.clinicId);

    if (existing) {
      return { status: 'already_linked', externalPatientId: existing.externalPatientId };
    }

    const match = await this.matcher.matchPatient({
      clinicId: input.clinicId,
      healthNumber: input.healthNumber,
      dateOfBirth: input.dateOfBirth,
    });

    if (match.status !== 'matched') {
      return match;
    }

    const identity = await this.identities.create({
      patientId: input.patientId,
      clinicId: input.clinicId,
      externalPatientId: match.externalPatientId,
      healthNumber: input.healthNumber,
    });

    return { status: 'linked', externalPatientId: identity.externalPatientId };
  }
}
