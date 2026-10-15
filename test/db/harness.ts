// db-test-kit-js v0.2 · ADAPT · when updating a copy, read CHANGELOG.md since this version
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import * as schema from "@/schema";

// Transaction-per-test isolation. Each test runs inside one open transaction
// that is rolled back when the test ends, so a test can mutate anything and
// leave nothing behind: no cleanup code, no per-test delete/insert.
//
// Two backends, same code: PGlite (in-process Postgres, the default; nothing to
// install) or a real Postgres when TEST_DATABASE_URL is set. Only this file and
// test/db/bootstrap.ts know which.
//
// App code imports the `db` singleton, so test/db/setup.ts mocks "@/db" with
// `testDb`: a proxy forwarding every call to the current test's transaction.
// `db.transaction()` inside app code becomes a SAVEPOINT, which is what we want.
//
// Caveats of one wrapping transaction (each pinned by test/harness-caveats.test.ts):
//  - One connection, so "concurrent" queries serialize. A test about real
//    concurrency calls `useCommittedDb()` and needs a real Postgres.
//  - now() / defaultNow() are the transaction's start time.
//  - A failed statement aborts the whole transaction; wrap an expected failure
//    in `db.transaction()` (a savepoint).
//  - Outside a test transaction (e.g. a query in `beforeAll`) `db` throws instead
//    of silently committing, unless the file called `useCommittedDb()`.
//
// Why `aroundEach`: it wraps the test AND its hooks, so cleanup is guaranteed.
// A `beforeEach`/`afterEach` pair can leave stale state behind when `beforeEach`
// fails (see the older-Vitest variant in RECREATE.md).

export type TestDatabase = PgDatabase<PgQueryResultHKT, typeof schema>;

class Rollback extends Error {}

export const usingRealPostgres = Boolean(process.env.TEST_DATABASE_URL);

let pglite: PGlite | undefined;
let pool: Pool | undefined;
let real: TestDatabase | undefined;
let current: TestDatabase | undefined;
let committed = false;

/** The underlying connection: what runs when no test transaction is open. */
export function committedDb(): TestDatabase {
  if (!real) {
    if (usingRealPostgres) {
      pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
      real = drizzlePg({ client: pool, schema });
    } else {
      pglite = new PGlite(); // in-memory, one per test file
      real = drizzlePglite({ client: pglite, schema }) as unknown as TestDatabase;
    }
  }
  return real;
}

/**
 * Opt this test file out of rollback: everything commits, on real concurrent
 * connections. For tests about races and locking only, and only meaningful on
 * a real Postgres. Scope the data to an organization of its own.
 */
export function useCommittedDb() {
  committed = true;
}

/** What "@/db"'s `db` is replaced with in tests. */
export const testDb = new Proxy({} as TestDatabase, {
  get(_, prop) {
    // Outside a test transaction a query would silently commit. Fail loudly,
    // unless this file opted into committed mode on purpose.
    if (!current && !committed) {
      throw new Error("db used outside a test transaction (e.g. in beforeAll/module scope). Query inside a test, or call useCommittedDb().");
    }
    const t = current ?? committedDb();
    const value = Reflect.get(t, prop, t);
    return typeof value === "function" ? value.bind(t) : value;
  },
});

/** Run `runTest` inside a transaction, then roll it back. Used by vitest's `aroundEach`. */
export async function inRolledBackTransaction(runTest: () => Promise<void>) {
  if (committed) return runTest();
  try {
    await committedDb().transaction(async (tx) => {
      current = tx as unknown as TestDatabase;
      try {
        await runTest();
      } finally {
        current = undefined;
      }
      // A transaction callback that returns normally COMMITS. Throwing is what rolls back.
      throw new Rollback();
    });
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }
}

export async function closeTestDatabase() {
  await pool?.end();
  await pglite?.close();
  pool = undefined;
  pglite = undefined;
  real = undefined;
}
