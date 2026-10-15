# Changelog

The kit has one version number, stamped on the first line of every COPY/ADAPT file
(`pnpm kit:stamp`; `test/kit-version.test.ts` fails if a file is stale). A copy of the kit in another
repo carries the version it was taken from, so updating it means reading the entries *after* that version
(see "Updating an existing copy" in RECREATE.md). A copy with no header predates 0.2 and is 0.1.

## 0.2 (2026-10-15)
- `test/db/harness.ts` (both variants): `db`/`prisma` now **throws outside a test transaction** (for example
  in `beforeAll`) instead of silently committing, unless the file called `useCommittedDb()`.
  `test/harness-caveats.test.ts` pins it.
- Prisma variant added (`variants/prisma/`).
- Files get a version header.

## 0.1 (2026-10-15)
- Initial core: rollback harness (`aroundEach` + sentinel throw), fixtures runtime (`identify`, `idOf`,
  `fixtures`, `loadFixtures`), factories, session seam, seam guard, caveat tests, CI.
