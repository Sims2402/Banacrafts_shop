/** True when the UI should show seller portal chrome (nav, footer), not customer storefront chrome. */
export function isSellerPortalPath(pathname: string): boolean {
  return pathname.startsWith("/seller");
}

export function getStoredUserRole(): string | null {
  try {
    const raw = localStorage.getItem("banacrafts_user");
    if (!raw) return null;
    const u = JSON.parse(raw) as { role?: string };
    return typeof u?.role === "string" ? u.role.toLowerCase() : null;
  } catch {
    return null;
  }
}

/**
 * Seller portal chrome (navbar, footer): use on `/seller/*` **or** whenever the
 * logged-in user is a seller, so `/artisans`, `/awareness`, etc. keep seller nav.
 */
export function isSellerPortalContext(
  pathname: string,
  authRole: string | null | undefined
): boolean {
  if (isSellerPortalPath(pathname)) return true;
  const r = (authRole || getStoredUserRole() || "").toLowerCase();
  return r === "seller";
}
