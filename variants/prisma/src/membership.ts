import { prisma } from "./db";
import { getSession } from "./session";

// The tenant boundary. Call it first in every org-scoped function. Tests never
// mock it: they sign a user in and let this run against the member table.
export async function requireMembership(organizationId: string): Promise<{ userId: string; role: string }> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  const row = await prisma.member.findFirst({ where: { organizationId, userId: session.user.id } });
  if (!row) throw new Error("Not a member of this organization");
  return { userId: session.user.id, role: row.role };
}
