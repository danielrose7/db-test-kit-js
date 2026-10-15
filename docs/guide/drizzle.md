# Adopt the Drizzle version

The root project is the canonical Drizzle implementation. Do not copy its example domain wholesale.
Use the classifications in `RECREATE.md`.

## What normally transfers unchanged

- fixture identity and label helpers;
- fixed fixture clock;
- global setup shape;
- rollback sentinel behavior;
- the test that forbids database access outside a transaction.

## What must match the target

- schema and database module imports;
- migration runner and migrations directory;
- session lookup module;
- seam-guard allow-list;
- fixture rows and dependency order;
- factories and authorization tests;
- test database name, URL, and safety rules.

## Driver boundary

Production may use Neon's HTTP driver while tests use `node-postgres` or PGlite. The requirement is not
that production and tests share a transport; it is that application queries share the same Drizzle schema
and the test driver supports an interactive transaction held open across a test.

## Canonical procedure

Read the complete [`RECREATE.md`](https://github.com/danielrose7/db-test-kit-js/blob/main/RECREATE.md)
before editing a target repository. It includes reconnaissance, the file map, verification failures to
induce deliberately, and pitfalls discovered during cold adoption trials.
