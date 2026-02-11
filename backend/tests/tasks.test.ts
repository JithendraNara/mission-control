import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/db/index.js';
import { tasks } from '../src/db/schema.js';
import { app } from '../src/app.js';

describe('Tasks API', () => {
  beforeEach(async () => {
    // Clean up tasks before each test
    await db.delete(tasks);
  });

  describe('POST /api/v1/tasks', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'Test Task',
        description: 'Test description',
        owner: 'forge',
        priority: 'high',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tasks',
        payload: newTask,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe(newTask.title);
      expect(body.data.owner).toBe(newTask.owner);
      expect(body.data.status).toBe('todo');
      expect(body.data.id).toBeDefined();
    });

    it('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tasks',
        payload: { description: 'Missing title and owner' },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_INPUT');
    });

    it('should validate owner enum', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tasks',
        payload: {
          title: 'Test',
          owner: 'invalid-role',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('should return paginated tasks', async () => {
      // Create test tasks
      await db.insert(tasks).values([
        { title: 'Task 1', owner: 'forge', status: 'todo' },
        { title: 'Task 2', owner: 'frontend', status: 'doing' },
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tasks',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.tasks).toHaveLength(2);
      expect(body.data.pagination).toBeDefined();
    });

    it('should filter by status', async () => {
      await db.insert(tasks).values([
        { title: 'Task 1', owner: 'forge', status: 'todo' },
        { title: 'Task 2', owner: 'forge', status: 'done' },
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tasks?filter=status:done',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.tasks).toHaveLength(1);
      expect(body.data.tasks[0].status).toBe('done');
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('should return task by id', async () => {
      const [task] = await db.insert(tasks)
        .values({ title: 'Find me', owner: 'qa' })
        .returning();

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/tasks/${task.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.title).toBe('Find me');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tasks/00000000-0000-0000-0000-000000000000',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/tasks/:id/status', () => {
    it('should update task status', async () => {
      const [task] = await db.insert(tasks)
        .values({ title: 'Status test', owner: 'atlas', status: 'todo' })
        .returning();

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/tasks/${task.id}/status`,
        payload: { status: 'doing' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.status).toBe('doing');
      expect(body.data.startedAt).toBeDefined();
    });

    it('should set blocker reason when status is blocked', async () => {
      const [task] = await db.insert(tasks)
        .values({ title: 'Blocker test', owner: 'forge', status: 'doing' })
        .returning();

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/tasks/${task.id}/status`,
        payload: { status: 'blocked', blockerReason: 'Waiting for API' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.status).toBe('blocked');
      expect(body.data.blockerReason).toBe('Waiting for API');
    });
  });

  describe('GET /api/v1/tasks/blocked/all', () => {
    it('should return all blocked tasks', async () => {
      await db.insert(tasks).values([
        { title: 'Normal task', owner: 'forge', status: 'todo' },
        { title: 'Blocked 1', owner: 'qa', status: 'blocked', blockerReason: 'Reason 1' },
        { title: 'Blocked 2', owner: 'frontend', status: 'blocked', blockerReason: 'Reason 2' },
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tasks/blocked/all',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.tasks).toHaveLength(2);
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should delete task', async () => {
      const [task] = await db.insert(tasks)
        .values({ title: 'Delete me', owner: 'minerva' })
        .returning();

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/tasks/${task.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.deleted).toBe(true);

      // Verify deletion
      const findResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/tasks/${task.id}`,
      });
      expect(findResponse.statusCode).toBe(404);
    });
  });
});
