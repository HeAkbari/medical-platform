import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(input: Record<string, string | undefined>): Env {
  return envSchema.parse(input);
}
