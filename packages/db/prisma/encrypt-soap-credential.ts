/**
 * One-off helper: encrypt a fresh OSCAR SOAP credential (the output of
 * LoginService.login2) and print the SQL that updates only the SOAP fields of
 * one `ClinicCredential` row — the OAuth1 fields are left untouched.
 *
 * Needed because securityTokenKey is NOT permanently stable: it changed after
 * OSCAR's Tomcat was restarted (2026-09-29), making every SOAP call fail with
 * `FailedAuthentication`. See docs/oscar/new-approach/oscar-soap-schedule-services.md.
 *
 * Deliberately imports only ../src/crypto (node:crypto, no Prisma/node_modules)
 * so it runs in a bare `oven/bun` container on the VPS. Run with:
 *   CREDENTIALS_ENCRYPTION_KEY=... SOAP_SECURITY_ID=... SOAP_SECURITY_TOKEN_KEY=... \
 *     bun run prisma/encrypt-soap-credential.ts
 * then run the printed SQL against the app database, and restart the app
 * (the decrypted credential is cached in-process).
 */
import { encryptSecret } from '../src/crypto';

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

const encryptionKey = requireEnv('CREDENTIALS_ENCRYPTION_KEY');
const securityId = requireEnv('SOAP_SECURITY_ID');
const securityTokenKey = requireEnv('SOAP_SECURITY_TOKEN_KEY');
const clinicId = process.env.CLINIC_ID ?? 'sponsor-clinic';

const tokenEnc = encryptSecret(securityTokenKey, encryptionKey);

console.log(
  `UPDATE "ClinicCredential" SET "soapSecurityId" = ${sqlString(securityId)}, ` +
    `"soapSecurityTokenKeyEnc" = ${sqlString(tokenEnc)}, "updatedAt" = NOW() ` +
    `WHERE "clinicId" = ${sqlString(clinicId)};`
);
