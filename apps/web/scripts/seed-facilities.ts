/**
 * Seeds the `Facility` table from facilities-seed-data.json — a snapshot of
 * the retired MOCK_MAP_FACILITIES fixture (~24 facilities), kept as JSON so
 * a fresh database (new teammate, wiped local volume, CI) can be repopulated
 * without regenerating this data by hand. New clinics get added with their
 * own one-off seed going forward (see
 * docs/oscar/new-approach/docs-oscar-new-approach.md §4) — this script is
 * specifically for restoring the bootstrap dataset, not a template to extend.
 *
 * Run with: bun run scripts/seed-facilities.ts
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { prisma, type Prisma } from '@medical-platform/db';
import type { MapFacility } from '../src/features/map/types';

// Duplicated from apps/web/src/lib/oscar/client.ts (not imported — that file
// has `import 'server-only'`, which throws outside a Next.js request, same
// reason scripts/sync-doctors.ts inlines its own copy of this constant.
const OSCAR_CLINIC_ID = process.env.OSCAR_CLINIC_ID ?? 'sponsor-clinic';

// No real facility data from the sponsor clinic yet (deferred-items.md #1) —
// this placeholder id is linked to OSCAR_CLINIC_ID below so Doctor.clinicName
// and Physician Info's clinic address/hours/languages have *something* to
// join against; swap its fields in facilities-seed-data.json for the real
// clinic details once the clinic provides them, no code change needed.
const SPONSOR_CLINIC_FACILITY_ID = 'fac-sponsor-clinic';

async function main(): Promise<void> {
  const seedPath = join(import.meta.dirname, 'facilities-seed-data.json');
  const facilities: MapFacility[] = JSON.parse(readFileSync(seedPath, 'utf8'));

  for (const facility of facilities) {
    const data = facility as unknown as Prisma.InputJsonValue;
    const clinicId = facility.id === SPONSOR_CLINIC_FACILITY_ID ? OSCAR_CLINIC_ID : null;

    await prisma.facility.upsert({
      where: { id: facility.id },
      create: { id: facility.id, data, clinicId },
      update: { data, clinicId },
    });
  }

  console.log(`Seeded ${facilities.length} facilities.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
