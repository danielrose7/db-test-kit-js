import { Factory } from "fishery";
import { prisma } from "@/db";
import { newId } from "@/id";
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
    await prisma.project.create({ data: { id: projectId, organizationId, name: `Project ${sequence}` } });
    const id = newId();
    await prisma.task.create({ data: { id, organizationId, projectId, title: build.title } });
    return { ...build, id, organizationId, projectId };
  });
  return { title: `Task ${sequence}` };
});
