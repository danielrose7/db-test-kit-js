import { describe, expect, it } from "vitest";
import { prisma } from "@/db";
import { userFactory } from "./factories/user";
import { fx } from "./fixtures";
import { identify } from "./fixtures/runtime";

describe("fixtures + rollback harness", () => {
  it("loads the baseline with deterministic, label-derived ids", async () => {
    expect(fx.users.olivia.id).toBe(identify("users", "olivia"));
    const olivia = await prisma.user.findUniqueOrThrow({ where: { id: fx.users.olivia.id } });
    expect(olivia.name).toBe("Olivia Owner");
  });

  it("a test's writes are visible to it...", async () => {
    await prisma.user.update({ where: { id: fx.users.olivia.id }, data: { name: "Changed" } });
    await userFactory.create({ name: "RolledBack" });
    expect((await prisma.user.findUniqueOrThrow({ where: { id: fx.users.olivia.id } })).name).toBe("Changed");
  });

  it("...and gone in the next test", async () => {
    expect((await prisma.user.findUniqueOrThrow({ where: { id: fx.users.olivia.id } })).name).toBe("Olivia Owner");
    expect(await prisma.user.count({ where: { name: "RolledBack" } })).toBe(0);
  });
});
