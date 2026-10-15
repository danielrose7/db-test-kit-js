# Prisma variant

The same project as the repo root (tiny multi-tenant app, rollback-per-test harness, Rails-style fixtures,
fishery factories, `signInAs`), on Prisma 7. See `../../RECREATE.md` ("Prisma variant") for what differs
from the Drizzle files and why. This directory is **a thing to copy from, not a dependency**.

```bash
pnpm install
TEST_PG_URL=postgresql://<your-role>@localhost:5432 pnpm test
```

- **A real Postgres is required** (no in-process backend). `scripts/test.sh` builds a throwaway database;
  with no `TEST_PG_URL` it expects the root `docker-compose.yml` (`postgres:postgres@localhost:5432`).
- Prisma's engines don't infer your OS Postgres role like `psql` does, so on a machine where the role
  isn't `postgres` put it in `TEST_PG_URL`.
- `prisma`, `@prisma/client` and `@prisma/adapter-pg` are pinned to the same exact version on purpose.
- The generated client (`src/generated`) is gitignored; `pnpm test` and `pnpm typecheck` generate it.
