export enum Roles {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  RECEPTIONIST = 'receptionist',
  PATIENT = 'patient',
}

export const RoleClaims: Record<Roles, string[]> = {
  [Roles.ADMIN]: [
    'patients:read',
    'patients:write',
    'doctors:read',
    'doctors:write',
    'appointments:read',
    'appointments:write',
    'dashboard:read',
    'admin:access',
  ],
  [Roles.DOCTOR]: [
    'patients:read',
    'doctors:read',
    'appointments:read',
    'appointments:write',
    'dashboard:read',
  ],
  [Roles.RECEPTIONIST]: [
    'patients:read',
    'patients:write',
    'doctors:read',
    'appointments:read',
    'appointments:write',
    'dashboard:read',
  ],
  [Roles.PATIENT]: ['appointments:read'],
};
