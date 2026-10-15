import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// A tiny multi-tenant app: every org-scoped table carries organizationId and
// every query is scoped by it (see membership.ts). Ids are text so fixtures can
// use deterministic UUIDs and app code can use random ones.

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});

export const members = pgTable(
  "members",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organizations.id),
    userId: text("user_id").notNull().references(() => users.id),
    role: text("role").notNull().default("member"),
  },
  (t) => [index("members_org_user_idx").on(t.organizationId, t.userId)]
);

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  projectId: text("project_id").notNull().references(() => projects.id),
  title: text("title").notNull(),
  claimedBy: text("claimed_by"),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
