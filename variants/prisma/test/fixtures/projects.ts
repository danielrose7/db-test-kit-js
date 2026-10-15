import { FIXTURE_EPOCH } from "./clock";
import { organizationFixtures } from "./organizations";
import { fixtures, idOf } from "./runtime";

export const projectFixtures = fixtures("project", "projects", {
  website: { organizationId: idOf(organizationFixtures, "acme"), name: "Website", createdAt: FIXTURE_EPOCH },
  secret: { organizationId: idOf(organizationFixtures, "other"), name: "Secret roadmap", createdAt: FIXTURE_EPOCH },
});
