import 'server-only';
import { getClinicCredential } from '@medical-platform/domain/adapters/platform';
import { OscarClient, type OscarClientConfig } from '@medical-platform/domain/adapters/oscar';

// The pilot runs against a single clinic; once a second OSCAR/FHIR clinic is
// added this becomes a per-request lookup keyed by clinicId instead of one
// fixed env var (see docs/oscar/new-approach/docs-oscar-new-approach.md §5).
export const OSCAR_CLINIC_ID = process.env.OSCAR_CLINIC_ID ?? 'sponsor-clinic';

let cachedOscarClient: Promise<OscarClient> | null = null;

/**
 * OscarClientConfig comes from the encrypted `ClinicCredential` row (Postgres),
 * not an env var — that lookup is async, so the client is resolved lazily
 * and cached, rather than forcing every caller of `repositories`/services to
 * become async just for this one branch.
 */
export function getOscarClient(): Promise<OscarClient> {
  if (!cachedOscarClient) {
    cachedOscarClient = (async () => {
      const credential = await getClinicCredential(OSCAR_CLINIC_ID);

      if (!credential) {
        throw new Error(
          `No ClinicCredential row for clinicId="${OSCAR_CLINIC_ID}" — has it been seeded?`
        );
      }

      const config: OscarClientConfig = {
        baseUrl: credential.baseUrl,
        consumerKey: credential.consumerKey,
        consumerSecret: credential.consumerSecret,
        accessToken: credential.accessToken,
        accessTokenSecret: credential.accessTokenSecret,
        allowSelfSignedCert: credential.allowSelfSignedCert,
      };

      return new OscarClient(config);
    })();
  }

  return cachedOscarClient;
}
