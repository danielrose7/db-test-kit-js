import { organizationFixtures } from "./organizations";
import { projectFixtures } from "./projects";
import { fixtures, idOf } from "./runtime";

const DEFAULTS = {
  organizationId: idOf(organizationFixtures, "acme"),
  projectId: idOf(projectFixtures, "website"),
};

export const taskFixtures = fixtures("task", "tasks", {
  write_copy: { ...DEFAULTS, title: "Write homepage copy" },
  ship_it: { ...DEFAULTS, title: "Ship it" },
});
