# Choose an adoption path

Start with two questions: which ORM owns your transaction client, and how does application code obtain
that client?

| ORM | Application database access | Starting point |
|---|---|---|
| Drizzle | One imported singleton | Root project; mock the seam module |
| Drizzle | Dependency injection | Root project; pass `tx` and skip the module mock |
| Prisma 7 | One imported singleton | `variants/prisma`; mock the seam module |
| Prisma 7 | Dependency injection | `variants/prisma`; pass the interactive client |

## Use the Drizzle path when

- production uses Drizzle with Postgres;
- tests can use `node-postgres`, `postgres-js`, or PGlite for interactive transactions;
- the test process can run the project's migrations.

[Adopt the Drizzle version →](/guide/drizzle)

## Use the Prisma path when

- the project uses Prisma 7 with Postgres;
- a real disposable Postgres database is available;
- the generated client can be produced before tests.

[Adopt the Prisma version →](/guide/prisma)

## Stop before copying when

- the target does not use Postgres;
- database clients are constructed throughout the application instead of behind one seam;
- tests cannot open interactive transactions;
- an existing harness already solves rollback isolation and only fixtures or guard tests are missing.

In the last case, preserve the working harness and add only the missing layers. `RECREATE.md` begins with
this reconnaissance deliberately.
