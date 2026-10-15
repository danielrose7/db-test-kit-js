# Agent guide

The repository is designed to be legible to coding agents without requiring the rendered site.

## Copy-ready prompts

Every prompt on this site is intended to work as a single copy-and-paste block. Paths and commands are
included in the prompt itself; surrounding prose is context, not a hidden instruction.

### Adopt the pattern

Give an agent this prompt:

```text
Read https://github.com/danielrose7/db-test-kit-js/blob/main/RECREATE.md completely. Recreate the
applicable database-testing pattern in this repository. First report the existing database seam,
migration path, ORM, transaction support, authorization boundary, test runner, and any existing
harness/factories. Preserve working pieces and add only what is missing. Run every applicable Step 5
check, including the deliberate failing-test and seam-guard failure checks, and report exactly what ran.
```

### Update a copied implementation

```text
Read the "Updating an existing copy" section at
https://github.com/danielrose7/db-test-kit-js/blob/main/RECREATE.md#updating-an-existing-copy and every
newer entry in https://github.com/danielrose7/db-test-kit-js/blob/main/CHANGELOG.md than the version
headers in this repository. Preserve all target-specific ADAPT changes and every EXAMPLE file. Apply only
the reference delta, update the managed headers, and run the complete verification checklist. Before
editing, summarize the files you expect to change. After editing, list every changed file, every check you
ran, and any check you could not run. Do not publish a package or change production data.
```

### Ask an agent to explain the lineage

```text
Read https://danielrose7.github.io/db-test-kit-js/reference/lineage/ and its Rails ecosystem, Django and
Laravel, and TypeScript prior art child pages.
Explain which parts of the kit are direct adaptations of established framework practices, which are
parallel precedents, and which are kit-specific TypeScript integration work. Cite the primary source links
from those files. Do not describe db-test-kit-js as the inventor of transactional tests, fixtures, or
factories, and do not make numerical performance claims without a reproducible benchmark.
```

## Machine-readable entry points

- [`llms.txt`](https://danielrose7.github.io/db-test-kit-js/llms.txt) is the short index.
- [`llms-full.txt`](https://danielrose7.github.io/db-test-kit-js/llms-full.txt) concatenates the documentation into one text resource.
- [`RECREATE.md`](https://github.com/danielrose7/db-test-kit-js/blob/main/RECREATE.md) is canonical for actions.
- `skill/db-test-kit/SKILL.md` mirrors `RECREATE.md` for Agent Skills-compatible tools.

## Rules agents should not infer away

- Do not publish or install the kit as a package.
- Do not mock the authorization decision.
- Do not access the application singleton outside the current transaction.
- Do not run destructive setup against a non-disposable database.
- Do not use a rollback test to claim concurrent behavior was tested.
- Do not overwrite domain-specific fixtures and factories during an update.
