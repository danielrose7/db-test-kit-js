import { Factory } from "fishery";
import { db } from "@/db";
import { newId } from "@/id";
import { projects, tasks } from "@/schema";
import { organizationFactory } from "./organization";

export interface TaskBuild {
  organizationId?: string;
  title: string;
}
export interface TaskRecord extends TaskBuild {
  id: string;
  organizationId: string;
  projectId: string;
}

export const taskFactory = Factory.define<TaskBuild, unknown, TaskRecord>(({ sequence, onCreate }) => {
  onCreate(async (build) => {
    const organizationId = build.organizationId ?? (await organizationFactory.create()).id;
    const projectId = newId();
    await db.insert(projects).values({ id: projectId, organizationId, name: `Project ${sequence}` });
    const id = newId();
    await db.insert(tasks).values({ id, organizationId, projectId, title: build.title });
    return { ...build, id, organizationId, projectId };
  });
  return { title: `Task ${sequence}` };
});
