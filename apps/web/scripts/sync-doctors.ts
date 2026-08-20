/**
 * Periodic sync: pulls the current clinic's provider directory from OSCAR
 * (live, OAuth1-signed) and upserts it into the `Doctor` read model — the
 * only thing Find Physician / Physician Info / rating pages read from (see
 * docs/oscar/new-approach/docs-oscar-new-approach.md §5). Availability
 * stays fully live and is untouched by this script.
 *
 * OSCAR-specific for now (the pilot's one active clinic); generalize to
 * "whichever adapter this clinicId uses" once a second, differently-EMR'd
 * clinic is actually onboarded — not before, per the design doc's own
 * YAGNI guidance for multi-clinic dispatch.
 *
 * Run with: bun run scripts/sync-doctors.ts
 */
import { decryptSecret, prisma } from '@medical-platform/db';
import { OscarClient, OscarDoctorRepository } from '@medical-platform/domain/adapters/oscar';
import type { MapFacility } from '../src/features/map/types';

const CLINIC_ID = process.env.OSCAR_CLINIC_ID ?? 'sponsor-clinic';

async function main(): Promise<void> {
  const encryptionKey = process.env.CREDENTIALS_ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error('CREDENTIALS_ENCRYPTION_KEY is not set.');
  }

  const credentialRow = await prisma.clinicCredential.findUnique({
    where: { clinicId: CLINIC_ID },
  });

  if (!credentialRow) {
    throw new Error(`No ClinicCredential row for clinicId="${CLINIC_ID}".`);
  }

  const client = new OscarClient({
    baseUrl: credentialRow.baseUrl,
    consumerKey: decryptSecret(credentialRow.consumerKeyEnc, encryptionKey),
    consumerSecret: decryptSecret(credentialRow.consumerSecretEnc, encryptionKey),
    accessToken: decryptSecret(credentialRow.accessTokenEnc, encryptionKey),
    accessTokenSecret: decryptSecret(credentialRow.accessTokenSecretEnc, encryptionKey),
    allowSelfSignedCert: credentialRow.allowSelfSignedCert,
  });

  const doctors = await new OscarDoctorRepository(client).findAll();

  // Facility linkage is optional (deferred-items.md #1) — a clinic can be
  // synced before any Facility row is linked to it, `clinicName` just stays
  // unset until one is.
  const facilityRow = await prisma.facility.findUnique({ where: { clinicId: CLINIC_ID } });
  const clinicName = facilityRow ? (facilityRow.data as unknown as MapFacility).name : undefined;

  for (const doctor of doctors) {
    await prisma.doctor.upsert({
      where: {
        clinicId_externalProviderId: {
          clinicId: CLINIC_ID,
          externalProviderId: doctor.id,
        },
      },
      create: {
        clinicId: CLINIC_ID,
        externalProviderId: doctor.id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialty: doctor.specialty,
        email: doctor.email,
        phone: doctor.phone,
        clinicName,
      },
      update: {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialty: doctor.specialty,
        email: doctor.email,
        phone: doctor.phone,
        clinicName,
        syncedAt: new Date(),
      },
    });
  }

  console.log(`Synced ${doctors.length} doctors for clinicId="${CLINIC_ID}".`);
}

main()
  .catch((error) => {
    console.error('Sync failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
