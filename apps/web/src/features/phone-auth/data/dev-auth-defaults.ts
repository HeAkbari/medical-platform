/** Pre-filled values for mock phone auth during local development. */
export const DEV_AUTH_DEFAULTS = {
  phone: '+1 555 0101',
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
