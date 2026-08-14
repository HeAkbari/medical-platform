import 'server-only';
import { LinkPatientToClinicUseCase } from '@medical-platform/domain';
import { PrismaPatientClinicIdentityStore } from '@medical-platform/domain/adapters/platform';
import { OscarClinicPatientMatcher } from '@medical-platform/domain/adapters/oscar';
import { getOscarClient } from './client';

let cached: Promise<LinkPatientToClinicUseCase> | null = null;

export function getLinkPatientToClinicUseCase(): Promise<LinkPatientToClinicUseCase> {
  if (!cached) {
    cached = (async () => {
      const client = await getOscarClient();

      return new LinkPatientToClinicUseCase(
        new PrismaPatientClinicIdentityStore(),
        new OscarClinicPatientMatcher(client)
      );
    })();
  }

  return cached;
}
