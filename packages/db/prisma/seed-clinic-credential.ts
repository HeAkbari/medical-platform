/**
 * One-off script: encrypt and upsert one clinic's OAuth1 credentials into
 * `ClinicCredential`. The three-legged OAuth1 handshake itself is done
 * manually (e.g. via the sponsor clinic's Postman collection) — this script
 * only stores the resulting long-lived values.
 *
 * Reads everything from env vars so plaintext credentials never live in
 * source (see packages/db/.env.example). Run with:
 *   bun run db:seed:clinic-credential
 */
import { encryptSecret, prisma } from '../src/index';

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

async function main(): Promise<void> {
  const encryptionKey = requireEnv('CREDENTIALS_ENCRYPTION_KEY');
  const clinicId = requireEnv('SEED_CLINIC_ID');
  const emrType = process.env.SEED_EMR_TYPE ?? 'oscar';
  const baseUrl = requireEnv('SEED_OSCAR_BASE_URL');
  const consumerKey = requireEnv('SEED_CONSUMER_KEY');
  const consumerSecret = requireEnv('SEED_CONSUMER_SECRET');
  const accessToken = requireEnv('SEED_ACCESS_TOKEN');
  const accessTokenSecret = requireEnv('SEED_ACCESS_TOKEN_SECRET');
  const allowSelfSignedCert = process.env.SEED_ALLOW_SELF_SIGNED_CERT === 'true';

  const encryptedFields = {
    emrType,
    baseUrl,
    allowSelfSignedCert,
    consumerKeyEnc: encryptSecret(consumerKey, encryptionKey),
    consumerSecretEnc: encryptSecret(consumerSecret, encryptionKey),
    accessTokenEnc: encryptSecret(accessToken, encryptionKey),
    accessTokenSecretEnc: encryptSecret(accessTokenSecret, encryptionKey),
  };

  await prisma.clinicCredential.upsert({
    where: { clinicId },
    create: { clinicId, ...encryptedFields },
    update: encryptedFields,
  });

  console.log(`Upserted ClinicCredential for clinicId="${clinicId}" (emrType=${emrType}).`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
