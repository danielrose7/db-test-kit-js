# Sources and prior art

Last reviewed: **October 15, 2026**. Version-sensitive behavior is also pinned by executable tests;
documentation links provide context but do not replace those tests.

This page is the compact source index. [Design lineage](/reference/lineage/) explains what the kit takes
from each ecosystem, what it changes, and what it deliberately leaves behind.

## Primary documentation

- [Vitest Test API](https://vitest.dev/api/test) — `aroundEach`, scoped fixtures, concurrency and
  runner behavior.
- [VitePress deployment guide](https://vitepress.dev/guide/deploy) — static GitHub Pages build and
  repository base paths.
- [Drizzle with PGlite](https://orm.drizzle.team/docs/connect-pglite) — the zero-service database
  used by the default reference suite.
- [Drizzle Seed](https://orm.drizzle.team/docs/seed-overview) — deterministic generated data. It is a
  neighboring tool, not the same thing as a small label-addressed committed fixture baseline.
- [Prisma 7 integration testing](https://www.prisma.io/docs/orm/v7/prisma-client/testing/integration-testing)
  — official real-database setup and suite-level seed/cleanup approach.
- [Prisma 7 transactions](https://www.prisma.io/docs/orm/v7/prisma-client/queries/transactions) —
  interactive transaction limits and options.
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html) —
  database semantics beneath both ORM implementations.

## Framework precedents

- [Rails `ActiveRecord::FixtureSet`](https://api.rubyonrails.org/classes/ActiveRecord/FixtureSet.html)
  — label-based fixtures, stable IDs, associations, shared defaults and transactional tests.
- [Django transactions in tests](https://docs.djangoproject.com/en/stable/topics/testing/tools/#django.test.TestCase)
  — isolation through transactions and rollback.
- [Laravel database testing](https://laravel.com/docs/database-testing) — factories, seeders and
  database refresh patterns.
- [Fishery](https://github.com/thoughtbot/fishery) — factory_bot-inspired TypeScript factories.

## Closest JavaScript prior art

- [`jest-prisma`](https://github.com/Quramy/jest-prisma) — transaction-per-test and Prisma client seam.
- [`vitest-environment-prisma-postgres`](https://github.com/codepunkt/vitest-environment-prisma-postgres)
  — maintained work extending the same family of Prisma/Vitest transaction patterns.

## Evidence boundary

The project is a TypeScript port and composition of established testing practices, not a claim to have
invented transactional tests, fixtures, or factories. Its original contribution is the worked combination:
two current ORM examples, typed label references, a deliberate application database seam, real tenancy
checks, executable caveat tests, committed-mode concurrency, and agent-readable adoption/update guidance.

Performance claims should be framed qualitatively unless accompanied by a reproducible project-specific
measurement. Transaction rollback avoids schema-wide cleanup work, so the advantage generally becomes more
meaningful as a schema and suite grow; exact ratios depend on the database, schema, hardware and workload.
