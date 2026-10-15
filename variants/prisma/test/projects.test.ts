import { describe, expect, it } from "vitest";
import { prisma } from "@/db";
import { createProject, getProject, listProjects } from "@/projects";
import { signInAs } from "./auth/session";
import { memberFactory } from "./factories/member";
import { fx } from "./fixtures";

// Server-function tests: the session is faked, but requireMembership (the
// tenant boundary), the queries and the audit write all run for real.

describe("projects (tenancy)", () => {
  it("rejects a signed-out caller", async () => {
    await expect(listProjects(fx.organizations.acme.id)).rejects.toThrow("Not authenticated");
  });

  it("rejects a signed-in user who isn't a member", async () => {
    signInAs(fx.users.ned);
    await expect(listProjects(fx.organizations.acme.id)).rejects.toThrow("Not a member");
  });

  it("lists the org's projects for a member, and writes an audit row on view", async () => {
    signInAs(fx.users.olivia);
    const list = await listProjects(fx.organizations.acme.id);
    expect(list.map((p) => p.name)).toEqual(["Website"]);

    const project = await getProject(fx.organizations.acme.id, fx.projects.website.id);
    expect(project?.name).toBe("Website");
    const logs = await prisma.auditLog.findMany({ where: { resourceId: fx.projects.website.id } });
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({ actorUserId: fx.users.olivia.id, action: "view" });
  });

  it("doesn't leak another org's project, even to a member of Acme", async () => {
    signInAs(fx.users.olivia);
    expect(await getProject(fx.organizations.acme.id, fx.projects.secret.id)).toBeNull();
    await expect(listProjects(fx.organizations.other.id)).rejects.toThrow("Not a member");
  });

  it("creates a project for a member created by a factory", async () => {
    // A brand-new tenant and user, built per test: no fixture needed.
    const m = await memberFactory.owner().create();
    signInAs(m.user);
    const id = await createProject(m.organizationId, "Fresh");
    expect((await listProjects(m.organizationId)).map((p) => p.id)).toEqual([id]);
  });
});
