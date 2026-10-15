# Compatibility

This project follows current stable releases rather than maximizing backward compatibility. “Tested”
means exercised by the reference projects, not merely allowed by a version range.

| Component | Tested reference | Policy |
|---|---|---|
| Node.js | 24 | Current stable/LTS line used by CI |
| pnpm | 11.25.0 | Exact package-manager declaration |
| TypeScript | 7.0.2 | Current stable used by both variants |
| Vitest | 5.0.4 | Current stable; `aroundEach` requires at least 4.1 |
| Drizzle ORM | 0.45.4 | Current stable at the last verification |
| PGlite | 0.5.10 | Zero-setup Drizzle backend |
| Prisma | 7.10.0 | Exact CLI/client/adapter pins in the variant |
| Postgres | 16 | Local scripts and CI service image |

Run `pnpm outdated` before a release. ORM, test-runner, and database upgrades require the full caveat
suite and deliberate-failure checks; they should not be treated as lockfile-only maintenance.

## Explicit non-goals

- MySQL, SQLite, MongoDB, and non-Postgres Drizzle dialects;
- Prisma 8 until a dedicated variant is implemented and verified;
- transparent support for arbitrary database client construction;
- preserving support for old runners at the expense of the primary implementation.

Older Vitest and Jest projects can use the hook-pair pattern in `RECREATE.md`, but the reference itself
tracks the current stable Vitest design.
