import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@medical-platform/db';
import {
  RoleClaims,
  Roles,
  type AuthenticatedUser,
} from '@medical-platform/auth';
import { normalizePhone, type CreatePatientInput } from '@medical-platform/domain';
import { repositories } from '@/lib/repositories';
import { OSCAR_CLINIC_ID } from '@/lib/oscar/client';
import { getEnsurePatientLinkedToClinicUseCase } from '@/lib/oscar/ensure-patient-linked-to-clinic';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const REGISTRATION_TTL_MS = 10 * 60 * 1000;
const BCRYPT_ROUNDS = 10;

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface AccountRecord {
  id: string;
  patientId: string;
}

export async function buildAuthenticatedUser(
  account: AccountRecord
): Promise<AuthenticatedUser | null> {
  const patient = await repositories.patients.findById(account.patientId);

  if (!patient) {
    return null;
  }

  return {
    id: account.id,
    email: patient.email ?? undefined,
    phone: patient.phone,
    firstName: patient.firstName,
    lastName: patient.lastName,
    dateOfBirth: patient.dateOfBirth ?? undefined,
    healthNumber: patient.healthNumber ?? undefined,
    addressLine: patient.addressLine ?? undefined,
    city: patient.city ?? undefined,
    province: patient.province ?? undefined,
    postalCode: patient.postalCode ?? undefined,
    patientId: patient.id,
    role: Roles.PATIENT,
    claims: RoleClaims[Roles.PATIENT],
  };
}

async function createSessionForAccount(accountId: string): Promise<string> {
  const session = await prisma.authSession.create({
    data: {
      id: randomUUID(),
      accountId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });

  return session.id;
}

/**
 * Best-effort: try to link the new patient into the (currently single)
 * configured clinic. Never blocks registration — a miss just means they stay
 * unlinked until booking provisions them. See
 * EnsurePatientLinkedToClinicUseCase / patient-clinic-linking-architecture.md.
 */
function tryLinkPatientToClinic(patientId: string): void {
  if (process.env.DATA_SOURCE !== 'oscar') {
    return;
  }

  getEnsurePatientLinkedToClinicUseCase()
    .then((useCase) => useCase.ensure(patientId, OSCAR_CLINIC_ID, { allowCreate: false }))
    .catch((error) => {
      console.error('Post-registration clinic linking failed (non-fatal):', error);
    });
}

export async function registerWithPassword(
  input: CreatePatientInput & { password: string }
): Promise<{ sessionId: string; user: AuthenticatedUser }> {
  const normalizedPhone = normalizePhone(input.phone);

  const [existingPatient, existingAccount] = await Promise.all([
    repositories.patients.findByPhone(normalizedPhone),
    prisma.patientAccount.findUnique({ where: { phone: normalizedPhone } }),
  ]);

  if (existingPatient || existingAccount) {
    throw new Error('An account with this phone number already exists');
  }

  const { password, ...patientInput } = input;
  const patient = await repositories.patients.create({
    ...patientInput,
    phone: input.phone.trim(),
  });

  tryLinkPatientToClinic(patient.id);

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const account = await prisma.patientAccount.create({
    data: {
      id: randomUUID(),
      patientId: patient.id,
      phone: normalizedPhone,
      passwordHash,
      email: patient.email ?? undefined,
    },
  });

  const user = await buildAuthenticatedUser(account);

  if (!user) {
    throw new Error('Unable to create user profile');
  }

  const sessionId = await createSessionForAccount(account.id);
  return { sessionId, user };
}

export async function loginWithPassword(
  phone: string,
  password: string
): Promise<{ sessionId: string; user: AuthenticatedUser }> {
  const normalizedPhone = normalizePhone(phone);
  const account = await prisma.patientAccount.findUnique({
    where: { phone: normalizedPhone },
  });

  if (!account || !account.passwordHash) {
    throw new Error(
      'No password is set for this phone number. Try signing in with Google instead.'
    );
  }

  const passwordMatches = await bcrypt.compare(password, account.passwordHash);

  if (!passwordMatches) {
    throw new Error('Invalid phone number or password');
  }

  const user = await buildAuthenticatedUser(account);

  if (!user) {
    throw new Error('Unable to load user profile');
  }

  const sessionId = await createSessionForAccount(account.id);
  return { sessionId, user };
}

export async function googleSignIn(idToken: string): Promise<
  | { status: 'authenticated'; sessionId: string; user: AuthenticatedUser }
  | {
      status: 'registration_required';
      token: string;
      email?: string;
      firstName?: string;
      lastName?: string;
    }
> {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Google sign-in is not configured on this server');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.sub) {
    throw new Error('Unable to verify Google account');
  }

  const googleId = payload.sub;
  const account = await prisma.patientAccount.findUnique({ where: { googleId } });

  if (account) {
    const user = await buildAuthenticatedUser(account);

    if (!user) {
      throw new Error('Unable to load user profile');
    }

    const sessionId = await createSessionForAccount(account.id);
    return { status: 'authenticated', sessionId, user };
  }

  const draft = await prisma.pendingGoogleRegistration.create({
    data: {
      token: randomUUID(),
      googleId,
      email: payload.email ?? undefined,
      firstName: payload.given_name ?? undefined,
      lastName: payload.family_name ?? undefined,
      expiresAt: new Date(Date.now() + REGISTRATION_TTL_MS),
    },
  });

  return {
    status: 'registration_required',
    token: draft.token,
    email: draft.email ?? undefined,
    firstName: draft.firstName ?? undefined,
    lastName: draft.lastName ?? undefined,
  };
}

export async function completeGoogleRegistration(
  token: string,
  input: CreatePatientInput
): Promise<{ sessionId: string; user: AuthenticatedUser }> {
  const draft = await prisma.pendingGoogleRegistration.findUnique({ where: { token } });

  if (!draft || draft.expiresAt <= new Date()) {
    if (draft) {
      await prisma.pendingGoogleRegistration.delete({ where: { token } }).catch(() => undefined);
    }

    throw new Error('Registration session expired. Sign in with Google again.');
  }

  const normalizedPhone = normalizePhone(input.phone);

  const [existingPatient, existingAccount] = await Promise.all([
    repositories.patients.findByPhone(normalizedPhone),
    prisma.patientAccount.findUnique({ where: { phone: normalizedPhone } }),
  ]);

  if (existingPatient || existingAccount) {
    throw new Error('An account with this phone number already exists');
  }

  const patient = await repositories.patients.create({
    ...input,
    email: input.email ?? draft.email ?? undefined,
    phone: input.phone.trim(),
  });

  tryLinkPatientToClinic(patient.id);

  const account = await prisma.patientAccount.create({
    data: {
      id: randomUUID(),
      patientId: patient.id,
      phone: normalizedPhone,
      googleId: draft.googleId,
      email: draft.email ?? patient.email ?? undefined,
    },
  });

  await prisma.pendingGoogleRegistration.delete({ where: { token } }).catch(() => undefined);

  const user = await buildAuthenticatedUser(account);

  if (!user) {
    throw new Error('Unable to create user profile');
  }

  const sessionId = await createSessionForAccount(account.id);
  return { sessionId, user };
}

export async function getUserBySessionId(
  sessionId: string
): Promise<AuthenticatedUser | null> {
  const session = await prisma.authSession.findUnique({
    where: { id: sessionId },
    include: { account: true },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.authSession.delete({ where: { id: sessionId } }).catch(() => undefined);
    return null;
  }

  return buildAuthenticatedUser(session.account);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await prisma.authSession.deleteMany({ where: { id: sessionId } });
}

export const SESSION_COOKIE_NAME = 'mp_session';
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
