# Changelog

The kit has one version number, stamped on the first line of every COPY/ADAPT file
(`pnpm kit:stamp`; `test/kit-version.test.ts` fails if a file is stale). A copy of the kit in another
repo carries the version it was taken from, so updating it means reading the entries *after* that version
(see "Updating an existing copy" in RECREATE.md). A copy with no header predates 0.2 and is 0.1.

## 0.2 (2026-10-15)
- `db`/`prisma` now **throws outside a test transaction** (for example in `beforeAll`) instead of silently
  committing, unless the file called `useCommittedDb()`. New check for Step 5.
- Prisma variant added (`variants/prisma/`).
- Every COPY/ADAPT file gets a version header (add it to unchanged files too).

| File | Type | Change in 0.2 |
|---|---|---|
| `test/db/harness.ts` | ADAPT | throws outside a test transaction; comment explaining `aroundEach` |
| `test/harness-caveats.test.ts` | COPY | new test: "db used outside a test transaction fails loudly" |
| `test/db/setup.ts`, `bootstrap.ts`, `global-setup.ts`, `seam.test.ts` | ADAPT/COPY | header only |
| `test/fixtures/runtime.ts`, `clock.ts` | COPY | header only |
| `test/auth/session.ts` | ADAPT | header only |
- Updating a headerless 0.1 copy requires adding the 0.2 header to every existing COPY/ADAPT file,
  including files whose bodies did not otherwise change; see `RECREATE.md`.

## 0.1 (2026-10-15)
(No file table: 0.1 files carry no header, which is how a copy is recognized as 0.1.)
- Initial core: rollback harness (`aroundEach` + sentinel throw), fixtures runtime (`identify`, `idOf`,
  `fixtures`, `loadFixtures`), factories, session seam, seam guard, caveat tests, CI.
