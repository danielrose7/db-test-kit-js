# Adopt the Prisma version

`variants/prisma/` is a complete Prisma 7 project, not a sketch layered over the Drizzle source. Start
there because the ORM differences affect the harness, fixture types, loader, bootstrap, generated code,
and database requirements.

## Important differences

- Prisma requires real Postgres in this reference; there is no PGlite default.
- The interactive transaction uses explicit `timeout` and `maxWait` values.
- Fixture sets name Prisma delegates and use scalar foreign-key fields.
- Bootstrap runs `prisma generate` and `prisma migrate deploy`.
- Fixture loading uses a plain, unextended client so application extensions cannot reject cleanup.
- Prisma `@default(now())` behavior differs from SQL `DEFAULT now()`; both behaviors are pinned by tests.

## Version policy

The Prisma CLI, client, and adapter are pinned to exactly the same current stable Prisma 7 release. The
variant does not claim Prisma 8 compatibility: that major version changes core APIs and deserves a
separate implementation and test pass, not a widened version range.

## Dependency-injected applications

If application functions already accept a Prisma client, skip `vi.mock`. Pass the current transaction
client to the real functions and keep authorization dependencies real except for the session identity.

Read the [variant README](https://github.com/danielrose7/db-test-kit-js/blob/main/variants/prisma/README.md)
and then follow the Prisma section of `RECREATE.md`.
