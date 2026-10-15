# Rails testing ecosystem

Last reviewed against Rails **8.1.2** on October 15, 2026.

Rails is the principal inspiration for this kit. The correspondence is not “Rails has tests too”; it is a
specific data model for tests: committed shared fixtures, stable label-addressed identity, per-test
transactions, and factories for local variation.

## Transactional tests

Rails runs tests in database transactions by default and rolls those transactions back after the test.
That restores the committed starting state without deleting every inserted row or rebuilding the schema.
Rails also supports opting out when the behavior under test cannot live inside the wrapper transaction.

db-test-kit-js adapts that lifecycle to Vitest's `aroundEach` and ORM callback APIs. The harness deliberately
throws a private sentinel after the test body because a normally returned interactive-transaction callback
commits. Only that exact sentinel is swallowed; application and assertion errors still fail the test.

Primary source: [Testing Rails Applications — Transactions](https://guides.rubyonrails.org/testing.html#transactions).

## Fixtures as the common case

Rails fixtures are predefined records loaded into the test database. Rails guidance positions them as
shared default data, not as a way to spell every object a test might need. That boundary is retained here:
fixtures cover the small, stable world many tests read; factories create records owned by one test.

The kit does not copy Rails' YAML and ERB format. Fixture modules are TypeScript values checked against the
application schema, and loader order is explicit.

Primary source: [Testing Rails Applications — Fixtures](https://guides.rubyonrails.org/testing.html#the-low-down-on-fixtures).

## Labels and deterministic identity

`ActiveRecord::FixtureSet.identify(label)` gives a fixture label a stable identifier. Rails also lets one
fixture refer to another by label, so relationships remain readable rather than embedding opaque IDs.

The kit ports both ideas. `identify(fixtureSet, label)` derives a UUIDv5 from the fixture-set name and label;
`idOf(fixtureSet, label)` preserves that readability while making an invalid label a TypeScript error. The
fixture-set component prevents identical labels in different tables from sharing an ID.

Primary source: [ActiveRecord::FixtureSet](https://api.rubyonrails.org/v8.1.2/classes/ActiveRecord/FixtureSet.html).

## Factories as the complement

factory_bot is not Rails core, but it is the most direct ancestor of the factory half of the design. Its
factories provide defaults, traits describe reusable variations, and associations build related records.
Fishery brings that vocabulary to TypeScript.

db-test-kit-js adds one firm boundary: `build()` is pure and persistence happens in `onCreate`. Lazy
associations avoid creating a related graph when a test supplies an existing record.

Primary sources: [factory_bot factory reference](https://thoughtbot.github.io/factory_bot/ref/factory.html),
[traits with associations](https://thoughtbot.github.io/factory_bot/traits/with-associations.html), and
[association reference](https://thoughtbot.github.io/factory_bot/ref/association.html).

## What this kit deliberately does not port

- YAML/ERB fixture evaluation and model-shaped global fixture accessors.
- Implicit application database replacement that can silently miss a second connection.
- A claim that one wrapper transaction can test behavior requiring independent transactions.
- Framework-owned magic that an application cannot inspect, copy, or adapt.

The result should feel familiar to a Rails tester while remaining ordinary, explicit TypeScript.
