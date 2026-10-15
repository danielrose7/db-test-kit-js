import { memberFixtures } from "./members";
import { organizationFixtures } from "./organizations";
import { projectFixtures } from "./projects";
import { taskFixtures } from "./tasks";
import { userFixtures } from "./users";

// Read-only baseline: `fx.users.olivia.id`, `fx.organizations.acme.id`.
// Tests that read share it; tests that write do so inside their rolled-back
// transaction, or build their own rows with a factory.
// Add a file per table and list it here, parents first.

export const fx = {
  organizations: organizationFixtures.rows,
  users: userFixtures.rows,
  members: memberFixtures.rows,
  projects: projectFixtures.rows,
  tasks: taskFixtures.rows,
};

/** Insert order = dependency order (parents first). */
export const allFixtureSets = [organizationFixtures, userFixtures, memberFixtures, projectFixtures, taskFixtures];
