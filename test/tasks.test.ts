import { describe, expect, it } from "vitest";
import { claimTask } from "@/tasks";
import { signInAs } from "./auth/session";
import { fx } from "./fixtures";

describe("claimTask", () => {
  it("claims an unclaimed task once", async () => {
    signInAs(fx.users.olivia);
    expect(await claimTask(fx.organizations.acme.id, fx.tasks.write_copy.id)).toBe(true);
    expect(await claimTask(fx.organizations.acme.id, fx.tasks.write_copy.id)).toBe(false);
  });

  it("a rolled-back claim leaves the fixture task unclaimed for the next test", async () => {
    signInAs(fx.users.olivia);
    expect(await claimTask(fx.organizations.acme.id, fx.tasks.write_copy.id)).toBe(true);
  });
});
