import { OscarClient } from './oscar-client';
import type { OscarDemographicCreateInput } from './oscar-types';

export interface ProvisionOscarDemographicInput {
  firstName: string;
  lastName: string;
  /** `YYYY-MM-DD`. Required — OSCAR needs a real DOB to create a demographic. */
  dateOfBirth: string;
  healthNumber: string | null;
  email: string | null;
  phone: string;
  addressLine: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  /** The doctor being booked — added to the new patient's doctor list. */
  targetProviderNo: string;
}

function buildCreatePayload(
  input: ProvisionOscarDemographicInput
): OscarDemographicCreateInput {
  const dob = new Date(`${input.dateOfBirth}T00:00:00Z`);

  return {
    firstName: input.firstName,
    lastName: input.lastName,
    dateOfBirth: dob.getTime(),
    dobYear: input.dateOfBirth.slice(0, 4),
    dobMonth: input.dateOfBirth.slice(5, 7),
    dobDay: input.dateOfBirth.slice(8, 10),
    // Not collected by this app — 'U' (Unknown) is a real OSCAR value, not a guess.
    sex: 'U',
    hin: input.healthNumber ?? '',
    chartNo: '',
    email: input.email ?? '',
    phone: input.phone,
    address: {
      address: input.addressLine ?? '',
      city: input.city ?? '',
      province: input.province ?? '',
      postal: input.postalCode ?? '',
    },
    doctors: [{ providerNo: input.targetProviderNo }],
  };
}

/**
 * `POST /demographics` — creates a new patient record in OSCAR. Verified
 * live (2026-09-25) with a full payload copied from a real patient; NOT yet
 * verified with the minimal payload this function actually sends (no prior
 * OSCAR history to copy `provider`/other fields from) — see
 * docs/oscar/new-approach/oscar-verified-service-catalog.md for the open
 * risk. The response echoes the request rather than reflecting real DB
 * state for some fields (verified for `provider`, likely also `doctors`) —
 * only `demographicNo` from the response is trusted here.
 */
export async function createOscarDemographic(
  client: OscarClient,
  input: ProvisionOscarDemographicInput
): Promise<{ demographicNo: string }> {
  const payload = buildCreatePayload(input);
  const created = (await client.post('/demographics', payload)) as
    | { demographicNo?: number | string }
    | null;

  if (!created || created.demographicNo == null) {
    throw new Error('OSCAR did not return a demographicNo for the newly created patient.');
  }

  return { demographicNo: String(created.demographicNo) };
}
