// db-test-kit-js v0.2 · COPY · when updating a copy, read CHANGELOG.md since this version
import { bootstrap } from "./bootstrap";
import { closeTestDatabase, usingRealPostgres } from "./harness";

// Real Postgres only: migrate and load fixtures once per run. (PGlite is
// in-process, so it bootstraps per test file in setup.ts instead.)
export default async function setup() {
  if (!usingRealPostgres) return;
  await bootstrap();
  await closeTestDatabase();
}
