import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function resolveKey(encryptionKeyHex: string): Buffer {
  const key = Buffer.from(encryptionKeyHex, 'hex');

  if (key.length !== 32) {
    throw new Error(
      'CREDENTIALS_ENCRYPTION_KEY must be a 32-byte key, hex-encoded (64 hex characters).'
    );
  }

  return key;
}

/** Encrypts a single secret value for storage in `ClinicCredential`. */
export function encryptSecret(plaintext: string, encryptionKeyHex: string): string {
  const key = resolveKey(encryptionKeyHex);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, ciphertext]).toString('base64');
}

/** Reverses {@link encryptSecret}. Throws if the key is wrong or the value was tampered with. */
export function decryptSecret(encoded: string, encryptionKeyHex: string): string {
  const key = resolveKey(encryptionKeyHex);
  const raw = Buffer.from(encoded, 'base64');
  const iv = raw.subarray(0, IV_LENGTH);
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
