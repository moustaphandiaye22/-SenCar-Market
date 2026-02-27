export function hasAnyRole(role: string | null | undefined, allowedRoles: readonly string[]): boolean {
  return role ? allowedRoles.includes(role) : false;
}

export function isOwnerOrHasAnyRole(
  userId: string,
  ownerId: string | null | undefined,
  role: string | null | undefined,
  allowedRoles: readonly string[],
): boolean {
  if (hasAnyRole(role, allowedRoles)) {
    return true;
  }

  return Boolean(ownerId) && userId === ownerId;
}
