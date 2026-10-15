import { prisma } from "./db";
import { newId } from "./id";

export async function logAuditEvent(input: {
  organizationId: string;
  actorUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
}) {
  await prisma.auditLog.create({ data: { id: newId(), ...input } });
}
