import { db } from "./db";
import { newId } from "./id";
import { auditLogs } from "./schema";

export async function logAuditEvent(input: {
  organizationId: string;
  actorUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
}) {
  await db.insert(auditLogs).values({ id: newId(), ...input });
}
