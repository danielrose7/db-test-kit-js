import { logAuditEvent } from "./audit";
import { prisma } from "./db";
import { newId } from "./id";
import { requireMembership } from "./membership";

export async function listProjects(organizationId: string) {
  await requireMembership(organizationId);
  return prisma.project.findMany({ where: { organizationId } });
}

export async function getProject(organizationId: string, projectId: string) {
  const { userId } = await requireMembership(organizationId);
  // Scoped by organizationId as well as id: an unguessable id is not a boundary.
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } });
  if (project) {
    await logAuditEvent({ organizationId, actorUserId: userId, action: "view", resourceType: "project", resourceId: projectId });
  }
  return project;
}

export async function createProject(organizationId: string, name: string) {
  const { userId } = await requireMembership(organizationId);
  const id = newId();
  await prisma.project.create({ data: { id, organizationId, name } });
  await logAuditEvent({ organizationId, actorUserId: userId, action: "create", resourceType: "project", resourceId: id });
  return id;
}
