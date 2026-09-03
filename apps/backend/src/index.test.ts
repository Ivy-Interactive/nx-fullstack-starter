import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
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

  it('GET /api/health queries DB service and returns aggregated health', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        service: 'db-service',
        status: 'ok',
        port: 3002,
        database: 'connected',
        timestamp: new Date().toISOString(),
        uptime: 12.3,
      }),
    }));

    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('ok');
    expect(body.database).toBe('connected');
    expect(body.dbService?.service).toBe('db-service');
  });

  it('GET /api/items forwards requests to DB service', async () => {
    const mockItems = [{ id: 1, title: 'Item from DB service', completed: false }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockItems,
    }));

    const response = await app.inject({
      method: 'GET',
      url: '/api/items',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toEqual(mockItems);
  });

  it('POST /api/items validates title and forwards to DB service', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: {},
    });
    expect(response.statusCode).toBe(400);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 99, title: 'New Item', completed: false }),
    }));

    const validResponse = await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: { title: 'New Item' },
    });
    expect(validResponse.statusCode).toBe(201);
  });
});
