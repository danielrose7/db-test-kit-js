# Agent guide

The repository is designed to be legible to coding agents without requiring the rendered site.

## Adopt the pattern

Give an agent this prompt:

```text
Read RECREATE.md in db-test-kit-js completely. Recreate the applicable database-testing pattern in
this repository. First report the existing database seam, migration path, ORM, transaction support,
authorization boundary, test runner, and any existing harness/factories. Preserve working pieces and
add only what is missing. Run every applicable Step 5 check, including the deliberate failing-test and
seam-guard failure checks, and report exactly what ran.
```

## Update a copied implementation

```text
Read the "Updating an existing copy" section of RECREATE.md and every CHANGELOG entry newer than the
version headers in this repository. Preserve all target-specific ADAPT changes and every EXAMPLE file.
Apply only the reference delta, update the managed headers, and run the complete verification checklist.
```

## Machine-readable entry points

- [`/llms.txt`](/llms.txt) is the short index.
- [`/llms-full.txt`](/llms-full.txt) concatenates the documentation into one text resource.
- [`RECREATE.md`](https://github.com/danielrose7/db-test-kit-js/blob/main/RECREATE.md) is canonical for actions.
- `skill/db-test-kit/SKILL.md` mirrors `RECREATE.md` for Agent Skills-compatible tools.

## Rules agents should not infer away

- Do not publish or install the kit as a package.
- Do not mock the authorization decision.
- Do not access the application singleton outside the current transaction.
- Do not run destructive setup against a non-disposable database.
- Do not use a rollback test to claim concurrent behavior was tested.
- Do not overwrite domain-specific fixtures and factories during an update.
