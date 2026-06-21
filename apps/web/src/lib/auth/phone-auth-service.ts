import { randomUUID } from 'node:crypto';
import {
  RoleClaims,
  Roles,
  type AuthenticatedUser,
} from '@medical-platform/auth';
import { normalizePhone, type CreatePatientInput } from '@medical-platform/domain';
import { repositories } from '@/lib/repositories';

const OTP_TTL_MS = 5 * 60 * 1000;
const REGISTRATION_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DEV_OTP_CODE = '123456';

interface OtpRecord {
  phone: string;
  code: string;
  expiresAt: number;
}

interface RegistrationRecord {
  phone: string;
  expiresAt: number;
}

interface AuthAccount {
  id: string;
  phone: string;
  patientId: string;
}

interface SessionRecord {
  userId: string;
  expiresAt: number;
}

interface PhoneAuthState {
  otpByPhone: Map<string, OtpRecord>;
  registrationByToken: Map<string, RegistrationRecord>;
  accountsByPhone: Map<string, AuthAccount>;
  sessions: Map<string, SessionRecord>;
}

declare global {
  var __phoneAuthState: PhoneAuthState | undefined;
}

function getPhoneAuthState(): PhoneAuthState {
  if (!globalThis.__phoneAuthState) {
    globalThis.__phoneAuthState = {
      otpByPhone: new Map(),
      registrationByToken: new Map(),
      accountsByPhone: new Map(),
      sessions: new Map(),
    };
  }

  return globalThis.__phoneAuthState;
}

async function buildAuthenticatedUser(
  account: AuthAccount
): Promise<AuthenticatedUser | null> {
  const patient = await repositories.patients.findById(account.patientId);

  if (!patient) {
    return null;
  }

  return {
    id: account.id,
    email: patient.email,
    phone: patient.phone,
    firstName: patient.firstName,
    lastName: patient.lastName,
    patientId: patient.id,
    role: Roles.PATIENT,
    claims: RoleClaims[Roles.PATIENT],
  };
}

function purgeExpiredRecords(state: PhoneAuthState, now: number): void {
  for (const [phone, record] of state.otpByPhone.entries()) {
    if (record.expiresAt <= now) {
      state.otpByPhone.delete(phone);
    }
  }

  for (const [token, record] of state.registrationByToken.entries()) {
    if (record.expiresAt <= now) {
      state.registrationByToken.delete(token);
    }
  }

  for (const [sessionId, record] of state.sessions.entries()) {
    if (record.expiresAt <= now) {
      state.sessions.delete(sessionId);
    }
  }
}

export async function sendOtp(phone: string): Promise<{ message: string }> {
  const state = getPhoneAuthState();
  const now = Date.now();
  purgeExpiredRecords(state, now);

  const normalizedPhone = normalizePhone(phone);
  const code = DEV_OTP_CODE;

  state.otpByPhone.set(normalizedPhone, {
    phone: normalizedPhone,
    code,
    expiresAt: now + OTP_TTL_MS,
  });

  console.info(`[phone-auth] OTP for ${normalizedPhone}: ${code}`);

  return {
    message: 'Verification code sent',
  };
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<
  | { status: 'authenticated'; sessionId: string; user: AuthenticatedUser }
  | { status: 'registration_required'; registrationToken: string; phone: string }
> {
  const state = getPhoneAuthState();
  const now = Date.now();
  purgeExpiredRecords(state, now);

  const normalizedPhone = normalizePhone(phone);
  const otpRecord = state.otpByPhone.get(normalizedPhone);

  if (!otpRecord || otpRecord.expiresAt <= now) {
    throw new Error('Verification code expired. Request a new one.');
  }

  if (otpRecord.code !== code) {
    throw new Error('Invalid verification code');
  }

  state.otpByPhone.delete(normalizedPhone);

  let account = state.accountsByPhone.get(normalizedPhone);

  // Resolve the cached account against current patient data. If it points at a
  // patient id that no longer exists — e.g. the FHIR sandbox was reseeded with
  // new ids — drop the stale account and look the patient up again by phone so
  // login keeps working across data resets.
  let user = account ? await buildAuthenticatedUser(account) : null;

  if (account && !user) {
    state.accountsByPhone.delete(normalizedPhone);
    account = undefined;
  }

  if (!account) {
    const existingPatient = await repositories.patients.findByPhone(normalizedPhone);

    if (existingPatient) {
      account = {
        id: randomUUID(),
        phone: normalizedPhone,
        patientId: existingPatient.id,
      };
      state.accountsByPhone.set(normalizedPhone, account);
      user = await buildAuthenticatedUser(account);
    }
  }

  if (account && user) {
    const sessionId = randomUUID();
    state.sessions.set(sessionId, {
      userId: account.id,
      expiresAt: now + SESSION_TTL_MS,
    });

    return {
      status: 'authenticated',
      sessionId,
      user,
    };
  }

  const registrationToken = randomUUID();
  state.registrationByToken.set(registrationToken, {
    phone: normalizedPhone,
    expiresAt: now + REGISTRATION_TTL_MS,
  });

  return {
    status: 'registration_required',
    registrationToken,
    phone: normalizedPhone,
  };
}

export async function completeRegistration(
  registrationToken: string,
  input: CreatePatientInput
): Promise<{ sessionId: string; user: AuthenticatedUser }> {
  const state = getPhoneAuthState();
  const now = Date.now();
  purgeExpiredRecords(state, now);

  const registration = state.registrationByToken.get(registrationToken);

  if (!registration || registration.expiresAt <= now) {
    throw new Error('Registration session expired. Verify your phone again.');
  }

  const normalizedPhone = normalizePhone(input.phone);

  if (normalizedPhone !== registration.phone) {
    throw new Error('Phone number does not match verified number');
  }

  const existingPatient = await repositories.patients.findByPhone(normalizedPhone);

  if (existingPatient) {
    throw new Error('An account with this phone number already exists');
  }

  const patient = await repositories.patients.create({
    ...input,
    phone: input.phone.trim(),
  });

  const account: AuthAccount = {
    id: randomUUID(),
    phone: normalizedPhone,
    patientId: patient.id,
  };

  state.accountsByPhone.set(normalizedPhone, account);
  state.registrationByToken.delete(registrationToken);

  const user = await buildAuthenticatedUser(account);

  if (!user) {
    throw new Error('Unable to create user profile');
  }

  const sessionId = randomUUID();
  state.sessions.set(sessionId, {
    userId: account.id,
    expiresAt: now + SESSION_TTL_MS,
  });

  return { sessionId, user };
}

export async function getUserBySessionId(
  sessionId: string
): Promise<AuthenticatedUser | null> {
  const state = getPhoneAuthState();
  const now = Date.now();
  purgeExpiredRecords(state, now);

  const session = state.sessions.get(sessionId);

  if (!session || session.expiresAt <= now) {
    state.sessions.delete(sessionId);
    return null;
  }

  const account = [...state.accountsByPhone.values()].find(
    (item) => item.id === session.userId
  );

  if (!account) {
    return null;
  }

  return buildAuthenticatedUser(account);
}

export function deleteSession(sessionId: string): void {
  getPhoneAuthState().sessions.delete(sessionId);
}

export const SESSION_COOKIE_NAME = 'mp_session';
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
