import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { members } from "./schema";
import { getSession } from "./session";

// The tenant boundary. Call it first in every org-scoped function. Tests never
// mock it: they sign a user in and let this run against the member table.
export async function requireMembership(organizationId: string): Promise<{ userId: string; role: string }> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  const [row] = await db
    .select()
    .from(members)
    .where(and(eq(members.organizationId, organizationId), eq(members.userId, session.user.id)));
  if (!row) throw new Error("Not a member of this organization");
  return { userId: session.user.id, role: row.role };
}
