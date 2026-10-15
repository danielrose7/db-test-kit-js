# Design lineage

db-test-kit-js is a TypeScript composition of mature database-testing practices. Its strongest lineage is
Rails: a small committed fixture baseline, human-readable labels, deterministic identifiers, factories for
variation, and a transaction rolled back after each test. Django and Laravel provide independent evidence
that transaction-backed isolation is a durable framework pattern rather than a Rails peculiarity.

The labels below keep the attribution precise:

- **Direct lineage** means an API or design in this kit was consciously adapted from that source.
- **Parallel precedent** means another ecosystem arrived at a similar practice independently.
- **Kit-specific adaptation** means integration work needed to make the practice explicit and safe in a
  Vitest, TypeScript, ORM, and application-module environment.

## Idea map

| Idea in this kit | Lineage | Where it appears here | Material difference |
|---|---|---|---|
| One rollback transaction per test | Rails direct lineage; Django and Laravel parallel precedent | `test/db/harness.ts`, `test/db/setup.ts` | A private thrown sentinel guarantees the ORM callback rolls back instead of committing |
| A small committed baseline | Rails fixtures direct lineage | `test/fixtures/`, global setup | Fixtures are typed TypeScript rows rather than YAML interpreted by the ORM |
| Stable IDs derived from labels | Rails `FixtureSet.identify` direct lineage | `test/fixtures/identify.ts` | UUIDv5 incorporates fixture-set identity as well as the label |
| Relationships written as label references | Rails fixture labels direct lineage | `idOf(fixtureSet, "label")` | TypeScript checks that the label belongs to that fixture set |
| Factories, traits, and lazy associations | factory_bot direct lineage, via Fishery | `test/factories/` | Persistence is isolated in `onCreate`; `build()` remains pure |
| Explicit non-transactional tests | Rails opt-out direct lineage | `useCommittedDb()` and committed-mode suites | The escape hatch is restricted to disposable Postgres and owns cleanup |
| Database reset alternatives | Django and Laravel parallel precedent | Caveat guidance and committed-mode cleanup | The kit does not hide truncation or migration behind its default path |
| Current-transaction application seam | Kit-specific adaptation | mocked application `db` module and transaction context | Production imports keep working while tests fail closed outside a transaction |
| Real authorization queries in tests | Kit-specific composition | session helper plus real membership query | Only identity lookup is replaceable; database authorization remains real |
| Executable caveats and update headers | Kit-specific maintenance design | caveat tests, managed headers, `RECREATE.md` | The copied implementation carries its own boundaries and provenance |

## Why Rails is the primary reference

Rails joins the relevant ideas into one established workflow. Transactional tests preserve a known
database state; fixture labels describe shared records; `identify` turns a label into a stable ID; and the
factory_bot ecosystem covers data that should vary per test. That combination is closer to this kit than
any single JavaScript package.

This is a port of the *testing model*, not of Rails syntax or global conventions. The kit keeps the useful
division of responsibilities while exposing the database seam, transaction lifetime, opt-out path, and
copy/update boundary as ordinary project code.

Continue with [Rails testing ecosystem](/reference/lineage/rails), then compare
[Django and Laravel](/reference/lineage/frameworks) and the available
[TypeScript prior art](/reference/lineage/typescript).

## Copy-ready research prompt

```text
Read the Design lineage section of the db-test-kit-js documentation, beginning with
docs/reference/lineage/index.md. Follow only its primary-source links. Produce a table with one row per
db-test-kit-js feature and columns for classification (direct lineage, parallel precedent, or kit-specific
adaptation), upstream source, local implementation file, and important semantic difference. Treat the
repository's executable tests as the authority for current implementation behavior. Do not claim that
db-test-kit-js invented transactional tests, fixtures, deterministic fixture IDs, or factories. Do not make
numerical performance claims unless you also provide a reproducible benchmark and environment details.
```
