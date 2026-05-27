import type { Roles } from './roles';

export interface AuthenticatedUser {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  patientId: string;
  role: Roles;
  claims: string[];
}
