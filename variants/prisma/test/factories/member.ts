import { Factory } from "fishery";
import { prisma } from "@/db";
import { newId } from "@/id";
import { organizationFactory } from "./organization";
import { userFactory, type UserRecord } from "./user";

export interface MemberBuild {
  organizationId?: string;
  userId?: string;
  role: string;
}
export interface MemberRecord extends MemberBuild {
  id: string;
  organizationId: string;
  user: UserRecord;
}

class MemberFactory extends Factory<MemberBuild, unknown, MemberRecord> {
  owner() {
    return this.params({ role: "owner" });
  }
}

export const memberFactory = MemberFactory.define(({ onCreate }) => {
  onCreate(async (build) => {
    // Lazy associations: no org/user passed means fresh ones.
    const organizationId = build.organizationId ?? (await organizationFactory.create()).id;
    const user = await userFactory.create();
    const id = newId();
    await prisma.member.create({ data: { id, organizationId, userId: build.userId ?? user.id, role: build.role } });
    return { ...build, id, organizationId, user };
  });
  return { role: "member" };
});
