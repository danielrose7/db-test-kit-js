// db-test-kit-js v0.2 · ADAPT · when updating a copy, read CHANGELOG.md since this version
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Transaction-per-test isolation (Prisma). Each test runs inside one open
// interactive transaction that is rolled back when the test ends, so a test
// can mutate anything and leave nothing behind.
//
// App code imports the `prisma` singleton, so test/db/setup.ts mocks "@/db"
// with `testDb`: a proxy forwarding every call to the current test's
// transaction client. A nested `$transaction()` in app code runs on that
// client too and rolls back to a savepoint on failure (observed on Prisma 7;
// `tx.$transaction` exists at runtime although it isn't in the types).
//
// Prisma-specific notes:
//  - Prisma's interactive-transaction default timeout is 5 s, shorter than a
//    slow test; we pass an explicit, generous `timeout`.
//  - `@default(now())` is stamped CLIENT-side by Prisma, so rows created in one
//    test get distinct created_at values. Only raw SQL `now()` is frozen at
//    transaction start (see test/harness-caveats.test.ts).
//  - There is no in-process backend: a real Postgres is required.
// Shared caveats: one connection (concurrent queries serialize; races need
// `useCommittedDb()`), and a failed statement aborts the whole transaction.

export type TestClient = PrismaClient;
type TxClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

class Rollback extends Error {}

let client: PrismaClient | undefined;
let current: TxClient | undefined;
let committed = false;

/** The underlying client: what runs when no test transaction is open. */
export function committedClient(): PrismaClient {
  if (!client) {
    const url = process.env.TEST_DATABASE_URL;
    if (!url) throw new Error("TEST_DATABASE_URL is not set; run `pnpm test`.");
    client = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  }
  return client;
}

/**
 * Opt this test file out of rollback: everything commits, on real concurrent
 * connections. For tests about races and locking only. Scope the data to an
 * organization of its own.
 */
export function useCommittedDb() {
  committed = true;
}

/** What "@/db"'s `prisma` is replaced with in tests. */
export const testDb = new Proxy({} as PrismaClient, {
  get(_, prop) {
    // Outside a test transaction a query would silently commit. Fail loudly,
    // unless this file opted into committed mode on purpose.
    if (!current && !committed) {
      throw new Error("prisma used outside a test transaction (e.g. in beforeAll/module scope). Query inside a test, or call useCommittedDb().");
    }
    const t = (current ?? committedClient()) as unknown as Record<string | symbol, unknown>;
    const value = Reflect.get(t, prop, t);
    return typeof value === "function" ? value.bind(t) : value;
  },
});

/** Run `runTest` inside a transaction, then roll it back. Used by vitest's `aroundEach`. */
export async function inRolledBackTransaction(runTest: () => Promise<void>) {
  if (committed) return runTest();
  try {
    await committedClient().$transaction(
      async (tx) => {
        current = tx;
        try {
          await runTest();
        } finally {
          current = undefined;
        }
        // A transaction callback that returns normally COMMITS. Throwing is what rolls back.
        throw new Rollback();
      },
      { timeout: 120_000, maxWait: 10_000 },
    );
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }
}

export async function closeTestDatabase() {
  await client?.$disconnect();
  client = undefined;
}
