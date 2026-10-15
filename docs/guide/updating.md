# Update an existing copy

Copied infrastructure needs a visible provenance trail. Every managed COPY or ADAPT file begins with a
header such as:

```ts
// db-test-kit-js v0.2 · ADAPT — copied; adapt only where RECREATE.md says
```

## The update loop

1. Read the copied files' headers. A missing header means the copy predates v0.2.
2. Read every newer entry in `CHANGELOG.md`.
3. Replace changed COPY files from the reference.
4. Apply changed ADAPT files as a three-way comparison, preserving the target's imports and seams.
5. Never overwrite EXAMPLE fixtures, factories, or domain tests.
6. Stamp touched files with the new version. A headerless v0.1→v0.2 update stamps every managed file.
7. Repeat the complete verification checklist, including deliberate failure checks.

The update procedure was tested on a reconstructed v0.1 copy. That trial found the header migration and
typecheck-command ambiguities now documented in the canonical instructions.

For operational details, use [`RECREATE.md`](https://github.com/danielrose7/db-test-kit-js/blob/main/RECREATE.md),
not this overview.
