# Quick start

The repository contains two small multi-tenant applications with the same tests. The default project
uses Drizzle and starts with PGlite, so it needs no database service. The Prisma project uses disposable
Postgres.

## Drizzle with zero setup

```bash
git clone https://github.com/danielrose7/db-test-kit-js.git
cd db-test-kit-js
corepack enable
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
```

The suite proves fixture loading, rollback isolation, a tenancy matrix, factories, savepoints,
transaction failure behavior, and the database seam. The concurrency test is skipped because PGlite's
single session cannot demonstrate a real race.

## Drizzle against Postgres

```bash
docker compose up -d
pnpm test:pg
```

This runs the same suite plus `test/tasks.concurrency.test.ts` against a throwaway database.

## Prisma 7 against Postgres

```bash
cd variants/prisma
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
```

The Prisma variant uses its own exact ORM/toolchain pins and lockfile. Its test script generates the
client, deploys migrations, loads the baseline, and runs the suite.

::: warning Use only a disposable test database
Committed-mode tests and fixture bootstrap mutate data outside the per-test rollback transaction.
Never point either project at development, staging, or production. Read [Database safety](/reference/safety)
before adapting the Postgres scripts.
:::

## Next

- [See how the transaction, fixtures, and factories fit together](/guide/how-it-works)
- [Choose an adoption path](/guide/choose-a-path)
- [Give the canonical checklist to an agent](/agents/)
