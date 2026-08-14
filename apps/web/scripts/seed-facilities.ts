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

async function main(): Promise<void> {
  const seedPath = join(import.meta.dirname, 'facilities-seed-data.json');
  const facilities: MapFacility[] = JSON.parse(readFileSync(seedPath, 'utf8'));

  for (const facility of facilities) {
    const data = facility as unknown as Prisma.InputJsonValue;

    await prisma.facility.upsert({
      where: { id: facility.id },
      create: { id: facility.id, data },
      update: { data },
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
