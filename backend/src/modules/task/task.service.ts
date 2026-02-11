import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { tasks, type Task, type NewTask, taskStatusEnum, roleEnum } from '../../db/schema.js';
import type { PaginatedRequest } from '../../types/index.js';

export class TaskService {
  async create(data: Omit<NewTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return task;
  }

  async findById(id: string): Promise<Task | null> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || null;
  }

  async findAll(params: PaginatedRequest = {}): Promise<{ tasks: Task[]; total: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const query = db.select().from(tasks);
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(tasks);

    // Apply filters
    let whereClause = undefined;
    if (params.filter) {
      const filters = params.filter.split(',').reduce((acc, f) => {
        const [key, value] = f.split(':');
        if (key && value) acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const conditions = [];
      if (filters.status) conditions.push(eq(tasks.status, filters.status));
      if (filters.owner) conditions.push(eq(tasks.owner, filters.owner));
      if (filters.priority) conditions.push(eq(tasks.priority, filters.priority));
      
      if (conditions.length > 0) {
        whereClause = and(...conditions);
      }
    }

    // Get total count
    const [{ count }] = await (whereClause 
      ? countQuery.where(whereClause) 
      : countQuery);

    // Get paginated results
    let finalQuery = whereClause ? query.where(whereClause) : query;

    // Apply sorting
    if (params.sort) {
      const [field, order] = params.sort.split(':');
      if (field === 'createdAt' || field === 'updatedAt' || field === 'priority') {
        finalQuery = order === 'asc' 
          ? finalQuery.orderBy(asc(tasks[field]))
          : finalQuery.orderBy(desc(tasks[field]));
      }
    } else {
      finalQuery = finalQuery.orderBy(desc(tasks.createdAt));
    }

    const results = await finalQuery.limit(limit).offset(offset);

    return { tasks: results, total: Number(count) };
  }

  async findByOwner(owner: string, params: PaginatedRequest = {}): Promise<{ tasks: Task[]; total: number }> {
    return this.findAll({ ...params, filter: `owner:${owner}` });
  }

  async findByStatus(status: string, params: PaginatedRequest = {}): Promise<{ tasks: Task[]; total: number }> {
    return this.findAll({ ...params, filter: `status:${status}` });
  }

  async findBlocked(): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.status, 'blocked')).orderBy(desc(tasks.updatedAt));
  }

  async update(id: string, data: Partial<NewTask>): Promise<Task | null> {
    const [task] = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task || null;
  }

  async updateStatus(
    id: string, 
    status: string, 
    blockerReason?: string
  ): Promise<Task | null> {
    const updates: Partial<NewTask> = { 
      status,
      updatedAt: new Date(),
    };

    if (status === 'doing' && !updates.startedAt) {
      updates.startedAt = new Date();
    }

    if (status === 'done') {
      updates.completedAt = new Date();
    }

    if (status === 'blocked' && blockerReason) {
      updates.blockerReason = blockerReason;
    }

    if (status !== 'blocked') {
      updates.blockerReason = null;
    }

    return this.update(id, updates);
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }

  async assign(id: string, assigneeId: string | null): Promise<Task | null> {
    return this.update(id, { assigneeId });
  }

  getValidStatuses(): readonly string[] {
    return taskStatusEnum;
  }

  getValidRoles(): readonly string[] {
    return roleEnum;
  }
}

export const taskService = new TaskService();
