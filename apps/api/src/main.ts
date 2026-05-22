/**
 * NestJS bootstrap placeholder.
 * Full Fastify + NestJS wiring will be added when the backend is implemented.
 */
export async function bootstrap(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(
    '[@medical-platform/api] Mock API skeleton — use Next.js route handlers for now.'
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void bootstrap();
}
