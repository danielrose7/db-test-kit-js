import { logAuditEvent } from "./audit";
import { prisma } from "./db";
import { requireMembership } from "./membership";

// The race-prone operation: two people click "claim" at once. A single
// conditional UPDATE (updateMany with claimedBy: null) makes exactly one of
// them win. Testing that needs real concurrent connections, so its test runs
// in committed mode (test/tasks.concurrency.test.ts).
export async function claimTask(organizationId: string, taskId: string): Promise<boolean> {
  const { userId } = await requireMembership(organizationId);
  const { count } = await prisma.task.updateMany({
    where: { id: taskId, organizationId, claimedBy: null },
    data: { claimedBy: userId, claimedAt: new Date() },
  });
  if (count === 0) return false;
  await logAuditEvent({ organizationId, actorUserId: userId, action: "claim", resourceType: "task", resourceId: taskId });
  return true;
}
