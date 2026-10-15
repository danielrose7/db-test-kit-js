import { Factory } from "fishery";
import { db } from "@/db";
import { newId } from "@/id";
import { users } from "@/schema";

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
    await db.insert(users).values({ id, ...build });
    return { ...build, id };
  });
  return { name: `User ${sequence}`, email: `user${sequence}-${newId().slice(-6)}@example.test` };
});
