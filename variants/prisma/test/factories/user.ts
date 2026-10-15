import { Factory } from "fishery";
import { prisma } from "@/db";
import { newId } from "@/id";

export interface UserBuild {
  name: string;
  email: string;
}
export interface UserRecord extends UserBuild {
  id: string;
}

export const userFactory = Factory.define<UserBuild, unknown, UserRecord>(({ sequence, onCreate }) => {
  onCreate(async (build) => {
    const id = newId();
    await prisma.user.create({ data: { id, ...build } });
    return { ...build, id };
  });
  return { name: `User ${sequence}`, email: `user${sequence}-${newId().slice(-6)}@example.test` };
});
