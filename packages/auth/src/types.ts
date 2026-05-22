import type { Roles } from './roles';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Roles;
  claims: string[];
}
