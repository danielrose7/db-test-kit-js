import { describe, expect, it } from "vitest";
import { claimTask } from "@/tasks";
import { signInAs } from "./auth/session";
import { memberFactory } from "./factories/member";
import { taskFactory } from "./factories/task";
import { useCommittedDb } from "./db/harness";

// Real concurrency needs real connections, which one wrapping transaction can't
// model, so this file commits (useCommittedDb). It builds an org of its own, so
// it can't disturb the fixtures or any other test.
useCommittedDb();

describe("claimTask (concurrent)", () => {
  it("exactly one of several simultaneous claims wins", async () => {
    const task = await taskFactory.create();
    const members = await Promise.all([1, 2, 3, 4].map(() => memberFactory.create({ organizationId: task.organizationId })));

    // The session is process-global in tests, so each claim signs in as its
    // own member immediately before starting.
    const results = await Promise.all(
      members.map(async (m) => {
        signInAs(m.user);
        return claimTask(task.organizationId, task.id);
      })
    );
    expect(results.filter(Boolean)).toHaveLength(1);
  });
});
