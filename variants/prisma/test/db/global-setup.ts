// db-test-kit-js v0.2 · ADAPT · when updating a copy, read CHANGELOG.md since this version
import { execFileSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { allFixtureSets } from "../fixtures";
import { loadFixtures, type LoaderClient } from "../fixtures/runtime";

// Once per run: migrate, then commit the fixture baseline. Uses a plain client
// (not the app's): if your app's client has extensions (soft delete,
// append-only) they would refuse the loader's deletes.
export default async function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL is not set; run `pnpm test`.");
  execFileSync("npx", ["prisma", "migrate", "deploy"], { stdio: "inherit", env: { ...process.env, DATABASE_URL: url } });
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  try {
    await loadFixtures(client as unknown as LoaderClient, allFixtureSets);
  } finally {
    await client.$disconnect();
  }
}
