import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { taskService } from './task.service.js';
import type { ApiResponse, PaginatedRequest } from '../../types/index.js';

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  owner: z.enum(['atlas', 'forge', 'frontend', 'designer', 'qa', 'minerva']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  dueDate: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).default({}),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  owner: z.enum(['atlas', 'forge', 'frontend', 'designer', 'qa', 'minerva']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  artifactPath: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['todo', 'doing', 'review', 'done', 'blocked']),
  blockerReason: z.string().optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.string().optional(),
  filter: z.string().optional(),
});

type CreateTaskBody = z.infer<typeof createTaskSchema>;
type UpdateTaskBody = z.infer<typeof updateTaskSchema>;
type UpdateStatusBody = z.infer<typeof updateStatusSchema>;
type ListQuery = z.infer<typeof listQuerySchema>;

// Helper for consistent responses
function sendResponse<T>(
  reply: FastifyReply,
  data: T,
  statusCode: number = 200,
  requestId: string
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  };
  reply.status(statusCode).send(response);
}

function sendError(
  reply: FastifyReply,
  code: string,
  message: string,
  statusCode: number = 400,
  requestId: string,
  details?: unknown
): void {
  const response: ApiResponse = {
    success: false,
    error: { code, message, details },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  };
  reply.status(statusCode).send(response);
}

export async function taskRoutes(app: FastifyInstance): Promise<void> {
  // Create task
  app.post('/', async (request: FastifyRequest<{ Body: CreateTaskBody }>, reply) => {
    const requestId = crypto.randomUUID();
    
    const parseResult = createTaskSchema.safeParse(request.body);
    if (!parseResult.success) {
      return sendError(reply, 'INVALID_INPUT', 'Validation failed', 400, requestId, parseResult.error.errors);
    }

    try {
      const task = await taskService.create({
        ...parseResult.data,
        dueDate: parseResult.data.dueDate ? new Date(parseResult.data.dueDate) : undefined,
      });
      sendResponse(reply, task, 201, requestId);
    } catch (error) {
      request.log.error(error);
      sendError(reply, 'INTERNAL_ERROR', 'Failed to create task', 500, requestId);
    }
  });

  // List tasks
  app.get('/', async (request: FastifyRequest<{ Querystring: ListQuery }>, reply) => {
    const requestId = crypto.randomUUID();
    
    const parseResult = listQuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      return sendError(reply, 'INVALID_INPUT', 'Invalid query parameters', 400, requestId);
    }

    try {
      const { tasks, total } = await taskService.findAll(parseResult.data);
      sendResponse(reply, {
        tasks,
        pagination: {
          page: parseResult.data.page,
          limit: parseResult.data.limit,
          total,
        },
      }, 200, requestId);
    } catch (error) {
      request.log.error(error);
      sendError(reply, 'INTERNAL_ERROR', 'Failed to fetch tasks', 500, requestId);
    }
  });

  // Get task by ID
  app.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const requestId = crypto.randomUUID();
    
    try {
      const task = await taskService.findById(request.params.id);
      if (!task) {
        return sendError(reply, 'NOT_FOUND', 'Task not found', 404, requestId);
      }
      sendResponse(reply, task, 200, requestId);
    } catch (error) {
      request.log.error(error);
      sendError(reply, 'INTERNAL_ERROR', 'Failed to fetch task', 500, requestId);
    }
  });

  // Update task
  app.patch('/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateTaskBody }>, reply) => {
    const requestId = crypto.randomUUID();
    
    const parseResult = updateTaskSchema.safeParse(request.body);
    if (!parseResult.success) {
      return sendError(reply, 'INVALID_INPUT', 'Validation failed', 400, requestId, parseResult.error.errors);
    }

    try {
      const updates: Parameters<typeof taskService.update>[1] = { ...parseResult.data };
      if (parseResult.data.dueDate !== undefined) {
        updates.dueDate = parseResult.data.dueDate ? new Date(parseResult.data.dueDate) : null;
      }
      
      const task = await taskService.update(request.params.id, updates);
      if (!task) {
        return sendError(reply, 'NOT_FOUND', 'Task not found', 404, requestId);
      }
      sendResponse(reply, task, 200, requestId);
    } catch (error) {
      request.log.error(error);
      sendError(reply, 'INTERNAL_ERROR', 'Failed to update task', 500, requestId);
    }
  });

  // Delete task
  app.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const requestId = crypto.randomUUID();
    
    try {
      const deleted = await taskService.delete(request.params.id);
      if (!deleted) {
        return sendError(reply, 'NOT_FOUND', 'Task not found', 404, requestId);
      }
      sendResponse(reply, { deleted: true }, 200, requestId);
    } catch (error) {
      request.log.error(error);
      sendError(reply, 'INTERNAL_ERROR', 'Failed to delete task', 500, requestId);
    }
  });

  // Update status
  app.patch('/:id/status', async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateStatusBody }>, reply) => {
    const requestId = crypto.randomUUID();
    
    const parseResult = updateStatusSchema.safeParse(request.body);
    if (!parseResult.success) {
      return sendError(reply, 'INVALID_INPUT', 'Validation failed', 400, requestId, parseResult.error.errors);
    }

    try {
      const task = await taskService.updateStatus(
        request.params.id,
        parseResult.data.status,
        parseResult.data.blockerReason
      );
      if (!task) {
        return sendError(reply, 'NOT_FOUND', 'Task not found', 404, requestId);
      }
      sendResponse(reply, task, 200, requestId);
    } catch (error) {
      request.log.error(error);
      sendError(reply, 'INTERNAL_ERROR', 'Failed to update status', 500, requestId);
    }
  });

  // List tasks by owner
  app.get('/by-owner/:owner', async (request: FastifyRequest<{ Params: { owner: string }; Querystring: ListQuery }>, reply) => {
    const requestId = crypto.randomUUID();
    
    const parseResult = listQuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      return sendError(reply, 'INVALID_INPUT', 'Invalid query parameters', 400, requestId);
    }

    try {
      const { tasks, total } = await taskService.findByOwner(request.params.owner, parseResult.data);
      sendResponse(reply, {
        tasks,
        pagination: {
          page: parseResult.data.page,
          limit: parseResult.data.limit,
          total,
        },
      }, 200, requestId);
    } catch (error) {
      request.log.error(error);
      sendError(reply, 'INTERNAL_ERROR', 'Failed to fetch tasks', 500, requestId);
    }
  });

  // List tasks by status
  app.get('/by-status/:status', async (request: FastifyRequest<{ Params: { status: string }; Querystring: ListQuery }>, reply) => {
    const requestId = crypto.randomUUID();
    
    const parseResult = listQuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      return sendError(reply, 'INVALID_INPUT', 'Invalid query parameters', 400, requestId);
    }

    try {
      const { tasks, total } = await taskService.findByStatus(request.params.status, parseResult.data);
      sendResponse(reply, {
        tasks,
        pagination: {
          page: parseResult.data.page,
          limit: parseResult.data.limit,
          total,
        },
      }, 200, requestId);
    } catch (error) {
      request.log.error(error);
      sendError(reply, 'INTERNAL_ERROR', 'Failed to fetch tasks', 500, requestId);
    }
  });

  // List blocked tasks
  app.get('/blocked/all', async (request, reply) => {
    const requestId = crypto.randomUUID();
    
    try {
      const tasks = await taskService.findBlocked();
      sendResponse(reply, { tasks }, 200, requestId);
    } catch (error) {
      request.log.error(error);
      sendError(reply, 'INTERNAL_ERROR', 'Failed to fetch blocked tasks', 500, requestId);
    }
  });

  // Get enum values
  app.get('/meta/enums', async (request, reply) => {
    const requestId = crypto.randomUUID();
    sendResponse(reply, {
      statuses: taskService.getValidStatuses(),
      roles: taskService.getValidRoles(),
    }, 200, requestId);
  });
}
