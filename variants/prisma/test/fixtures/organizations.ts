import { FIXTURE_EPOCH } from "./clock";
import { fixtures } from "./runtime";

export const organizationFixtures = fixtures("organization", "organizations", {
  acme: { name: "Acme", slug: "fx-acme", createdAt: FIXTURE_EPOCH },
  /** A second tenant, for cross-tenant assertions. */
  other: { name: "Other Co", slug: "fx-other", createdAt: FIXTURE_EPOCH },
});
