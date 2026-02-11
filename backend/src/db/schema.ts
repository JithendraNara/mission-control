import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';

// Enums as const for TypeScript
export const taskStatusEnum = ['todo', 'doing', 'review', 'done', 'blocked'] as const;
export const taskPriorityEnum = ['low', 'normal', 'high', 'urgent'] as const;
export const roleEnum = ['atlas', 'forge', 'frontend', 'designer', 'qa', 'minerva'] as const;

export type TaskStatus = typeof taskStatusEnum[number];
export type TaskPriority = typeof taskPriorityEnum[number];
export type Role = typeof roleEnum[number];

// Tasks table
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().default('00000000-0000-0000-0000-000000000000'),
  
  // Identity
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  
  // Assignment
  owner: varchar('owner', { length: 50 }).notNull(),
  assigneeId: uuid('assignee_id'),
  
  // State machine
  status: varchar('status', { length: 20 }).notNull().default('todo'),
  priority: varchar('priority', { length: 10 }).notNull().default('normal'),
  
  // Timeline
  dueDate: timestamp('due_date'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  
  // Context
  artifactPath: text('artifact_path'),
  blockerReason: text('blocker_reason'),
  
  // Flexibility
  metadata: jsonb('metadata').default({}),
  
  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Agents table (for future expansion)
export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  role: varchar('role', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  capabilities: text('capabilities').array(),
  webhookUrl: text('webhook_url'),
  isActive: boolean('is_active').default(true),
  lastSeenAt: timestamp('last_seen_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
