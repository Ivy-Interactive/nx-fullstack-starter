import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from './index';
import type { FastifyInstance } from 'fastify';

describe('Backend API Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health returns ok status and db connected', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('ok');
    expect(body.database).toBe('connected');
    expect(typeof body.port).toBe('number');
  });

  it('GET /api/items returns an array of items', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/items',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/items creates a new item', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: {
        title: 'Test Created Item',
        description: 'Testing SQLite insert',
      },
    });

    expect(response.statusCode).toBe(201);
    const item = JSON.parse(response.body);
    expect(item.title).toBe('Test Created Item');
    expect(item.completed).toBe(false);
  });
});
