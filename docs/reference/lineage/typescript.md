# TypeScript prior art

The TypeScript ecosystem contains strong pieces of this design, but they live at different layers. This kit
combines them into a worked application pattern and keeps the seams visible.

## Runner and factory building blocks

- [Vitest's Test API](https://vitest.dev/api/test) supplies `aroundEach`, scoped hooks, and the concurrency
  model used by the harness.
- [Fishery](https://github.com/thoughtbot/fishery) supplies factory_bot-inspired factories for TypeScript.
- [Drizzle Seed](https://orm.drizzle.team/docs/seed-overview) supplies deterministic generated data. It is
  useful neighboring work, but it is not the same abstraction as a small, committed, label-addressed
  fixture baseline.

## Transaction-focused packages

- [`jest-prisma`](https://github.com/Quramy/jest-prisma) demonstrates transaction-per-test isolation and a
  Prisma client seam in Jest.
- [`vitest-environment-prisma-postgres`](https://github.com/codepunkt/vitest-environment-prisma-postgres)
  continues that family of ideas for Prisma, Postgres, and Vitest.
- [Prisma's integration-testing guide](https://www.prisma.io/docs/orm/v7/prisma-client/testing/integration-testing)
  documents real-database setup with suite-level seed and cleanup.

These projects should be preferred when their abstraction matches the application. db-test-kit-js is most
useful as a reference when the team wants the whole pattern in its own repository: baseline fixtures,
factories, a current-transaction seam, real authorization coverage, committed-mode escape hatches, and
executable caveat tests.

## The kit-specific integration work

The novel value claimed here is deliberately narrow. It is not transactions, fixtures, or factories. It is
the documented combination and the safety boundary around a copy-owned implementation:

- ORM-specific harnesses that fail closed when code uses the database outside the active test transaction.
- Typed fixture labels and deterministic IDs that work across Drizzle and Prisma examples.
- An authorization test seam that replaces identity lookup without replacing the database decision.
- Tests that demonstrate nested transaction, connection, timer, and concurrency limitations.
- Version headers and an update procedure that distinguish managed reference code from local adaptations.

See [Sources and prior art](/reference/sources) for the compact link index and
[Compatibility](/reference/compatibility) for versions pinned by the executable examples.
