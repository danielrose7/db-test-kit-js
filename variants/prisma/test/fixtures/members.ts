import { organizationFixtures } from "./organizations";
import { fixtures, idOf } from "./runtime";
import { userFixtures } from "./users";

export const memberFixtures = fixtures("member", "members", {
  olivia_at_acme: {
    organizationId: idOf(organizationFixtures, "acme"),
    userId: idOf(userFixtures, "olivia"),
    role: "owner",
  },
});
