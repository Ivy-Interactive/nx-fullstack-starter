import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from './index';
import type { FastifyInstance } from 'fastify';

describe('DB Service Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns db-service status and db connected', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.service).toBe('db-service');
    expect(body.status).toBe('ok');
    expect(body.database).toBe('connected');
    expect(typeof body.port).toBe('number');
  });

  it('GET /items returns list of items', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/items',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /items inserts into SQLite', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/items',
      payload: {
        title: 'DB Service Test Item',
        description: 'Inserted directly via DB service',
      },
    });

    expect(response.statusCode).toBe(201);
    const item = JSON.parse(response.body);
    expect(item.title).toBe('DB Service Test Item');
    expect(item.completed).toBe(false);
  });
});
