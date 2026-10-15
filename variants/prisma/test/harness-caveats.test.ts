import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/db";
import { userFactory } from "./factories/user";
import { fx } from "./fixtures";

// Executable notes on what the rollback harness does and doesn't do (Prisma
// semantics). If one of these changes, the notes in test/db/harness.ts and the
// README are stale.

const olivia = () => prisma.user.findMany({ where: { id: fx.users.olivia.id } });
const insertDuplicate = () => prisma.user.create({ data: { id: fx.users.olivia.id, name: "Dup", email: "dup@example.test" } });

describe("rollback harness caveats (Prisma)", () => {
  it("a failed statement aborts the whole test transaction", async () => {
    await expect(insertDuplicate()).rejects.toThrow();
    // Postgres: "current transaction is aborted, commands ignored until end of transaction block".
    await expect(olivia()).rejects.toThrow();
  });

  it("wrap an expected failure in prisma.$transaction() (a savepoint) to keep going", async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        await tx.user.create({ data: { id: fx.users.olivia.id, name: "Dup", email: "dup@example.test" } });
      })
    ).rejects.toThrow();
    expect(await olivia()).toHaveLength(1);
  });

  it("app code's own prisma.$transaction() nests inside the test transaction and rolls back with it", async () => {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: fx.users.olivia.id }, data: { name: "InTx" } });
    });
    expect((await olivia())[0].name).toBe("InTx");
  });

  it("@default(now()) is stamped client-side, so rows in one test get distinct created_at", async () => {
    await userFactory.create();
    const a = await prisma.organization.create({ data: { id: "caveat-a", name: "A", slug: "caveat-a" } });
    await new Promise((r) => setTimeout(r, 15));
    const b = await prisma.organization.create({ data: { id: "caveat-b", name: "B", slug: "caveat-b" } });
    expect(a.createdAt.getTime()).not.toBe(b.createdAt.getTime());
  });

  it("raw SQL now() IS the transaction start time, so it is frozen for the whole test", async () => {
    const [first] = await prisma.$queryRaw<{ t: Date }[]>`select now() as t`;
    await new Promise((r) => setTimeout(r, 15));
    const [second] = await prisma.$queryRaw<{ t: Date }[]>`select now() as t`;
    expect(first.t.getTime()).toBe(second.t.getTime());
    // Never order assertions on a database-side timestamp; set explicit timestamps instead.
  });
});

// beforeAll runs outside any test transaction, where a query would silently
// commit. The harness makes that a loud error instead (unless the file opted
// into committed mode with useCommittedDb()).
describe("prisma used outside a test transaction", () => {
  let error: unknown;
  beforeAll(() => {
    try {
      void prisma.user;
    } catch (e) {
      error = e;
    }
  });

  it("fails loudly instead of silently committing", () => {
    expect(String(error)).toMatch(/outside a test transaction/);
  });
});
