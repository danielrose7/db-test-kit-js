// db-test-kit-js v0.2 · ADAPT · when updating a copy, read CHANGELOG.md since this version
import { afterAll, aroundEach, vi } from "vitest";
import { signOut } from "../auth/session";
import { closeTestDatabase, inRolledBackTransaction } from "./harness";

// Registered for every test file (vitest `setupFiles`).

// App code's `prisma` becomes the per-test transaction proxy.
vi.mock("@/db", async () => {
  const { testDb } = await import("./harness");
  return { prisma: testDb };
});

// Only the session lookup is faked (test/auth/session.ts); requireMembership,
// the tenant boundary, still runs for real.
vi.mock("@/session", async () => {
  const { currentSession } = await import("../auth/session");
  return { getSession: async () => currentSession() };
});

aroundEach(async (runTest) => {
  try {
    await inRolledBackTransaction(runTest);
  } finally {
    signOut(); // default is signed out
  }
});

afterAll(closeTestDatabase);
