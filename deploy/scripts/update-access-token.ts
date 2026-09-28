/**
 * One-off: rotate ONLY accessToken/accessTokenSecret on an existing
 * ClinicCredential row (consumerKey/consumerSecret/baseUrl/SOAP fields stay
 * untouched). Reads everything from env vars so no secret ever lands in
 * source. Run via the same builder image used for migrate/seed:
 *
 *   docker run --rm --network medical-platform-network \
 *     -e DATABASE_URL=... -e CREDENTIALS_ENCRYPTION_KEY=... \
 *     -e SEED_CLINIC_ID=sponsor-clinic \
 *     -e NEW_ACCESS_TOKEN=... -e NEW_ACCESS_TOKEN_SECRET=... \
 *     -w /app/packages/db medical-platform-builder \
 *     bun run ../../deploy/scripts/update-access-token.ts
 */
import { encryptSecret, prisma } from '../../packages/db/src/index';

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
  const accessToken = requireEnv('NEW_ACCESS_TOKEN');
  const accessTokenSecret = requireEnv('NEW_ACCESS_TOKEN_SECRET');

  const updated = await prisma.clinicCredential.update({
    where: { clinicId },
    data: {
      accessTokenEnc: encryptSecret(accessToken, encryptionKey),
      accessTokenSecretEnc: encryptSecret(accessTokenSecret, encryptionKey),
    },
    select: { clinicId: true, updatedAt: true },
  });

  console.log('Updated:', JSON.stringify(updated));
}

main()
  .catch((error) => {
    console.error('Update failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
