/**
 * Client-side admin check for OpenGrimoire (local operator session).
 * Prefer `GET /api/auth/session` with `credentials: 'include'`.
 */
export function isOpenGrimoireAdminSessionUser(user: { id?: string } | null | undefined): boolean {
  if (!user?.id) return false;
  return user.id === 'opengrimoire-admin';
}
