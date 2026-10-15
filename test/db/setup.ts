// db-test-kit-js v0.2 · ADAPT · when updating a copy, read CHANGELOG.md since this version
import { afterAll, aroundEach, beforeAll, vi } from "vitest";
import { signOut } from "../auth/session";
import { bootstrap } from "./bootstrap";
import { closeTestDatabase, inRolledBackTransaction, usingRealPostgres } from "./harness";

// Registered for every test file (vitest `setupFiles`).

// App code's `db` becomes the per-test transaction proxy.
vi.mock("@/db", async () => {
  const { testDb } = await import("./harness");
  return { db: testDb };
});

// Only the session lookup is faked (test/auth/session.ts); requireMembership,
// the tenant boundary, still runs for real.
vi.mock("@/session", async () => {
  const { currentSession } = await import("../auth/session");
  return { getSession: async () => currentSession() };
});

beforeAll(async () => {
  if (!usingRealPostgres) await bootstrap(); // real Postgres: done once in global-setup.ts
});

aroundEach(async (runTest) => {
  try {
    await inRolledBackTransaction(runTest);
  } finally {
    signOut(); // default is signed out
  }
});

afterAll(closeTestDatabase);
