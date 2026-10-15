import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// THE SEAM. Every query in the app goes through this one `db`. In tests,
// test/db/setup.ts replaces this module with a proxy onto the current test's
// transaction, so application code needs no changes and no injection.
// Nothing else may open a connection (test/db/seam.test.ts enforces it).
export const db = drizzle({ client: new Pool({ connectionString: process.env.DATABASE_URL }), schema });
