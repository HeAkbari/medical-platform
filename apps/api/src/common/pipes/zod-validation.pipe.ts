import type { ZodSchema } from 'zod';

/**
 * Zod validation pipe placeholder.
 */
export function zodPipe<T>(_schema: ZodSchema<T>): unknown {
  return undefined;
}
