import type { Roles } from './roles';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  phone: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  healthNumber?: string;
  addressLine?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  patientId: string;
  role: Roles;
  claims: string[];
}
