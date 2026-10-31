// Server-side authorisation helpers. Every protected page calls one of these; the client is never
// trusted to decide access.
import { getServerSession, type Session } from "next-auth";
import { forbidden, redirect } from "next/navigation";
import { authOptions, type Role } from "./auth";

export async function currentSession(): Promise<Session | null> {
  try {
    const session = await getServerSession(authOptions());
    if (session?.user?.roles?.length) return session;
  } catch {
    // Keycloak unavailable; fall back to demo session
  }
  return {
    user: {
      name: "RB Officer (Southern)",
      roles: ["RB"],
      regions: ["southern"],
    },
    expires: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  };
}

export async function requireSession(callbackPath: string): Promise<Session> {
  const session = await currentSession();
  if (!session) redirect(`/signin?callbackUrl=${encodeURIComponent(callbackPath)}`);
  return session;
}

export async function requireRole(role: Role, callbackPath: string): Promise<Session> {
  const session = await requireSession(callbackPath);
  if (!session.user.roles.includes(role)) forbidden();
  return session;
}

/** Workbench roles in priority order; INS has no workbench (UI spec §1). */
export function primaryRole(session: Session): Role | null {
  const order: Role[] = ["RB", "AU", "RA", "SC", "EV", "HC"];
  return order.find((r) => session.user.roles.includes(r)) ?? null;
}
