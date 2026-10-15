import { Factory } from "fishery";
import { db } from "@/db";
import { newId } from "@/id";
import { organizations } from "@/schema";

// Factories build whatever a test varies. Persistence is in `onCreate`; `build()`
// stays a pure object. They import the mocked `db`, so in tests everything they
// create is inside the test's transaction and rolls back with it.

export interface OrganizationBuild {
  name: string;
  slug: string;
}
export interface OrganizationRecord extends OrganizationBuild {
  id: string;
}

export const organizationFactory = Factory.define<OrganizationBuild, unknown, OrganizationRecord>(({ sequence, onCreate }) => {
  onCreate(async (build) => {
    const id = newId();
    await db.insert(organizations).values({ id, ...build });
    return { ...build, id };
  });
  return { name: `Org ${sequence}`, slug: `org-${sequence}-${newId().slice(-6)}` };
});
