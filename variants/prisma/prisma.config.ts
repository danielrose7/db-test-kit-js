import { defineConfig } from "prisma/config";

// DATABASE_URL is only read by Prisma's CLI (generate/migrate). The app and the
// tests build their own clients from explicit connection strings.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/unused" },
});
