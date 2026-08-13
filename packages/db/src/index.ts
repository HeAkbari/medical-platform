import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

export * from '@prisma/client';
export * from './crypto';

declare global {
  // eslint-disable-next-line no-var -- Next.js dev-mode hot-reload singleton pattern.
  var __medicalPlatformPrisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set — required to connect to the platform database.');
  }

  const adapter = new PrismaPg(connectionString);
  return new PrismaClient({ adapter });
}

// Reuse one client across Next.js dev-mode hot reloads instead of exhausting
// the Postgres connection pool with a fresh client per module reload.
export const prisma = globalThis.__medicalPlatformPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__medicalPlatformPrisma = prisma;
}
