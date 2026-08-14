import type {
  ClinicPatientMatcher,
  PatientMatchInput,
  PatientMatchResult,
} from '../../ports/patient-matching';
import { OscarClient, OscarHttpError } from './oscar-client';

interface MatchDemographicResponse {
  code: string;
  demographicNo?: number;
  message?: string;
}

export class OscarClinicPatientMatcher implements ClinicPatientMatcher {
  constructor(private readonly client: OscarClient) {}

  async matchPatient(input: PatientMatchInput): Promise<PatientMatchResult> {
    if (!input.healthNumber.trim() || !input.dateOfBirth.trim()) {
      // OSCAR 500s on a missing hin/dob rather than returning a clean 400 —
      // validate here so we never depend on that for correctness.
      return { status: 'invalid_data' };
    }

    try {
      const response = (await this.client.post('/demographics/matchDemographic', {
        hin: input.healthNumber,
        dob: input.dateOfBirth,
      })) as MatchDemographicResponse;

      if (response.code === 'A' && response.demographicNo != null) {
        return { status: 'matched', externalPatientId: String(response.demographicNo) };
      }

      if (response.code === 'F') {
        return { status: 'not_found' };
      }

      return { status: 'unavailable' };
    } catch (error) {
      if (error instanceof OscarHttpError && error.status >= 400 && error.status < 500) {
        return { status: 'invalid_data' };
      }

      return { status: 'unavailable' };
    }
  }
}
