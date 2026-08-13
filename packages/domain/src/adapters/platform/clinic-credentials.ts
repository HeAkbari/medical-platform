import 'server-only';
import { decryptSecret, prisma } from '@medical-platform/db';

export interface ClinicCredential {
  clinicId: string;
  emrType: string;
  baseUrl: string;
  allowSelfSignedCert: boolean;
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

// Decrypted values are cached in-process (per clinic) rather than
// re-decrypted on every request — same pattern as the OscarClient/FhirClient
// singletons. Rotation is a manual, out-of-band process (see design doc
// section 7), so there is no TTL/invalidation here.
const cache = new Map<string, ClinicCredential>();

function requireEncryptionKey(): string {
  const key = process.env.CREDENTIALS_ENCRYPTION_KEY;

  if (!key) {
    throw new Error('CREDENTIALS_ENCRYPTION_KEY is not set.');
  }

  return key;
}

export async function getClinicCredential(clinicId: string): Promise<ClinicCredential | null> {
  const cached = cache.get(clinicId);

  if (cached) {
    return cached;
  }

  const row = await prisma.clinicCredential.findUnique({ where: { clinicId } });

  if (!row) {
    return null;
  }

  const encryptionKey = requireEncryptionKey();

  let credential: ClinicCredential;

  try {
    credential = {
      clinicId: row.clinicId,
      emrType: row.emrType,
      baseUrl: row.baseUrl,
      allowSelfSignedCert: row.allowSelfSignedCert,
      consumerKey: decryptSecret(row.consumerKeyEnc, encryptionKey),
      consumerSecret: decryptSecret(row.consumerSecretEnc, encryptionKey),
      accessToken: decryptSecret(row.accessTokenEnc, encryptionKey),
      accessTokenSecret: decryptSecret(row.accessTokenSecretEnc, encryptionKey),
    };
  } catch {
    // Never leak the raw ciphertext or key material into logs — only which
    // clinic failed, so an operator knows what to re-seed.
    throw new Error(`Failed to decrypt credentials for clinicId="${clinicId}".`);
  }

  cache.set(clinicId, credential);
  return credential;
}
