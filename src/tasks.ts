import { and, eq, isNull } from "drizzle-orm";
import { logAuditEvent } from "./audit";
import { db } from "./db";
import { requireMembership } from "./membership";
import { tasks } from "./schema";

// The race-prone operation: two people click "claim" at once. A single
// conditional UPDATE makes exactly one of them win. Testing that claim needs
// real concurrent connections, so its test runs in committed mode on a real
// Postgres (test/tasks.concurrency.test.ts).
export async function claimTask(organizationId: string, taskId: string): Promise<boolean> {
  const { userId } = await requireMembership(organizationId);
  const claimed = await db
    .update(tasks)
    .set({ claimedBy: userId, claimedAt: new Date() })
    .where(and(eq(tasks.id, taskId), eq(tasks.organizationId, organizationId), isNull(tasks.claimedBy)))
    .returning({ id: tasks.id });
  if (claimed.length === 0) return false;
  await logAuditEvent({ organizationId, actorUserId: userId, action: "claim", resourceType: "task", resourceId: taskId });
  return true;
}
