import { defineConfig, env } from 'prisma/config';

// Prisma 7's CLI no longer auto-loads .env files, so load it ourselves before
// `env(...)` below resolves DATABASE_URL for migrate/generate/studio.
try {
  process.loadEnvFile();
} catch {
  // No packages/db/.env present — fine in CI, where DATABASE_URL is already set.
}

export default defineConfig({
  schema: 'prisma/schema',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
