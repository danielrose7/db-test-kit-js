import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

// THE SEAM. Every query in the app goes through this one `prisma`. In tests,
// test/db/setup.ts replaces this module with a proxy onto the current test's
// transaction, so application code needs no changes and no injection.
// Nothing else may open a connection (test/db/seam.test.ts enforces it).
export const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
