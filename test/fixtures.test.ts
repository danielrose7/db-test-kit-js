import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "@/db";
import { users } from "@/schema";
import { userFactory } from "./factories/user";
import { fx } from "./fixtures";
import { identify } from "./fixtures/runtime";

describe("fixtures + rollback harness", () => {
  it("loads the baseline with deterministic, label-derived ids", async () => {
    expect(fx.users.olivia.id).toBe(identify("users", "olivia"));
    const [olivia] = await db.select().from(users).where(eq(users.id, fx.users.olivia.id));
    expect(olivia.name).toBe("Olivia Owner");
  });

  it("a test's writes are visible to it...", async () => {
    await db.update(users).set({ name: "Changed" }).where(eq(users.id, fx.users.olivia.id));
    await userFactory.create({ name: "RolledBack" });
    const [olivia] = await db.select().from(users).where(eq(users.id, fx.users.olivia.id));
    expect(olivia.name).toBe("Changed");
  });

  it("...and gone in the next test", async () => {
    const [olivia] = await db.select().from(users).where(eq(users.id, fx.users.olivia.id));
    expect(olivia.name).toBe("Olivia Owner");
    expect(await db.select().from(users).where(eq(users.name, "RolledBack"))).toHaveLength(0);
  });
});
