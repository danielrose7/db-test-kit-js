import { and, eq } from "drizzle-orm";
import { logAuditEvent } from "./audit";
import { db } from "./db";
import { newId } from "./id";
import { requireMembership } from "./membership";
import { projects } from "./schema";

export async function listProjects(organizationId: string) {
  await requireMembership(organizationId);
  return db.select().from(projects).where(eq(projects.organizationId, organizationId));
}

export async function getProject(organizationId: string, projectId: string) {
  const { userId } = await requireMembership(organizationId);
  // Scoped by organizationId as well as id: an unguessable id is not a boundary.
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)));
  if (project) {
    await logAuditEvent({ organizationId, actorUserId: userId, action: "view", resourceType: "project", resourceId: projectId });
  }
  return project ?? null;
}

export async function createProject(organizationId: string, name: string) {
  const { userId } = await requireMembership(organizationId);
  const id = newId();
  await db.insert(projects).values({ id, organizationId, name });
  await logAuditEvent({ organizationId, actorUserId: userId, action: "create", resourceType: "project", resourceId: id });
  return id;
}
