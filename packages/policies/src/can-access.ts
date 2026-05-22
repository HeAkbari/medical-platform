import type { AuthenticatedUser } from '@medical-platform/auth';

export function hasClaim(user: AuthenticatedUser, claim: string): boolean {
  return user.claims.includes(claim);
}

export function hasAnyClaim(
  user: AuthenticatedUser,
  claims: string[]
): boolean {
  return claims.some((claim) => user.claims.includes(claim));
}

export function hasAllClaims(
  user: AuthenticatedUser,
  claims: string[]
): boolean {
  return claims.every((claim) => user.claims.includes(claim));
}

export function canAccess(
  user: AuthenticatedUser | null,
  requiredClaim: string
): boolean {
  if (!user) {
    return false;
  }

  return hasClaim(user, requiredClaim);
}
