// db-test-kit-js v0.2 · COPY · when updating a copy, read CHANGELOG.md since this version
import { eq, sql } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { db } from "@/db";
import { organizations, users } from "@/schema";
import { userFactory } from "./factories/user";
import { fx } from "./fixtures";

// Executable notes on what the rollback harness does and doesn't do. If one of
// these changes, the notes in test/db/harness.ts and the README are stale.

const olivia = () => db.select().from(users).where(eq(users.id, fx.users.olivia.id));
const insertDuplicate = () => db.insert(users).values({ id: fx.users.olivia.id, name: "Dup", email: "dup@example.test" });

describe("rollback harness caveats", () => {
  it("a failed statement aborts the whole test transaction", async () => {
    await expect(insertDuplicate()).rejects.toThrow();
    // Postgres: "current transaction is aborted, commands ignored until end of transaction block".
    await expect(olivia()).rejects.toThrow();
  });

  it("wrap an expected failure in db.transaction() (a savepoint) to keep going", async () => {
    await expect(db.transaction(async (tx) => {
      await tx.insert(users).values({ id: fx.users.olivia.id, name: "Dup", email: "dup@example.test" });
    })).rejects.toThrow();
    expect(await olivia()).toHaveLength(1);
  });

  it("app code's own db.transaction() nests inside the test transaction and rolls back with it", async () => {
    await db.transaction(async (tx) => {
      await tx.update(users).set({ name: "InTx" }).where(eq(users.id, fx.users.olivia.id));
    });
    expect((await olivia())[0].name).toBe("InTx");
  });

  it("now() and defaultNow() columns are the transaction's start time, so rows share created_at", async () => {
    const [a, b] = [await userFactory.create(), await userFactory.create()];
    void a; void b;
    // organizations.created_at defaults to now(); two inserts in one test share it.
    await db.insert(organizations).values({ id: "caveat-a", name: "A", slug: "caveat-a" });
    await new Promise((r) => setTimeout(r, 15));
    await db.insert(organizations).values({ id: "caveat-b", name: "B", slug: "caveat-b" });
    const rows = await db.select({ createdAt: organizations.createdAt }).from(organizations).where(sql`${organizations.id} in ('caveat-a', 'caveat-b')`);
    expect(new Set(rows.map((r) => r.createdAt.getTime())).size).toBe(1);
    // So never order a test's assertions on created_at; set explicit timestamps instead.
  });
});

// beforeAll runs outside any test transaction, where a query would silently
// commit. The harness makes that a loud error instead (unless the file opted
// into committed mode with useCommittedDb()).
describe("db used outside a test transaction", () => {
  let error: unknown;
  beforeAll(() => {
    try {
      void db.select;
    } catch (e) {
      error = e;
    }
  });

  it("fails loudly instead of silently committing", () => {
    expect(String(error)).toMatch(/outside a test transaction/);
  });
});
