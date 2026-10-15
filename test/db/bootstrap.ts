// db-test-kit-js v0.2 · ADAPT · when updating a copy, read CHANGELOG.md since this version
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { allFixtureSets } from "../fixtures";
import { loadFixtures } from "../fixtures/runtime";
import { committedDb, usingRealPostgres, type TestDatabase } from "./harness";

// Brings a database to "migrated + fixtures loaded". On a real Postgres this
// runs once per vitest run (global-setup.ts); on PGlite, once per test file
// (setup.ts), because each file has its own in-memory instance.
export async function bootstrap(db: TestDatabase = committedDb()) {
  const migrationsFolder = "./drizzle";
  if (usingRealPostgres) await migratePg(db as never, { migrationsFolder });
  else await migratePglite(db as never, { migrationsFolder });
  await loadFixtures(db, allFixtureSets);
}
