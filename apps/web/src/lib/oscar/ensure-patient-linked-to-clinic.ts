import 'server-only';
import { EnsurePatientLinkedToClinicUseCase } from '@medical-platform/domain';
import {
  PrismaPatientClinicIdentityStore,
  PrismaPatientRepository,
} from '@medical-platform/domain/adapters/platform';
import { getOscarClient, getOscarSoapClient } from './client';

let cached: Promise<EnsurePatientLinkedToClinicUseCase> | null = null;

export function getEnsurePatientLinkedToClinicUseCase(): Promise<EnsurePatientLinkedToClinicUseCase> {
  if (!cached) {
    cached = (async () => {
      const [client, soapClient] = await Promise.all([getOscarClient(), getOscarSoapClient()]);

      return new EnsurePatientLinkedToClinicUseCase(
        new PrismaPatientClinicIdentityStore(),
        new PrismaPatientRepository(),
        soapClient,
        client
      );
    })();
  }

  return cached;
}
