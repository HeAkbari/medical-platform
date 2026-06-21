/**
 * Pre-filled values for phone auth during local development.
 * The phone matches the seeded patient "Hesam Akbari" (docs/oscar/seed.py),
 * who has the richest demo data (appointments, results, prescriptions, etc.).
 */
export const DEV_AUTH_DEFAULTS = {
  phone: '+1 416 555 0101',
  otpCode: '123456',
  firstName: 'Jane',
  lastName: 'Rivera',
  dateOfBirth: '1988-04-12',
  email: 'jane.rivera@example.com',
} satisfies {
  phone: string;
  otpCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
};

export function getDevAuthDefaults() {
  return { ...DEV_AUTH_DEFAULTS };
}
