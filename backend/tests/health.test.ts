import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../src/app.js';

describe('Health Check', () => {
  it('should return ok status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });
});

describe('API Response Format', () => {
  it('should return 404 with proper error format', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/non-existent-route',
    });

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.meta.requestId).toBeDefined();
    expect(body.meta.timestamp).toBeDefined();
  });
});
