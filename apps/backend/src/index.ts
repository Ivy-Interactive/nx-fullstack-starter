import * as dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import type { HealthResponse, DbServiceHealth, CreateItemDto, UpdateItemDto, Item } from '@proj/shared';

const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST || '0.0.0.0';
const dbServiceUrl = process.env.DB_SERVICE_URL || 'http://localhost:3002';

export function buildApp() {
  const fastify = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  });

  fastify.register(cors, {
    origin: true,
  });

  // Health endpoint: checks backend health and polls DB service health
  fastify.get<{ Reply: HealthResponse }>('/api/health', async () => {
    let dbHealth: DbServiceHealth | undefined;
    let databaseStatus: 'connected' | 'disconnected' = 'disconnected';

    try {
      const res = await fetch(`${dbServiceUrl}/health`);
      if (res.ok) {
        dbHealth = (await res.json()) as DbServiceHealth;
        databaseStatus = dbHealth.database;
      }
    } catch {
      databaseStatus = 'disconnected';
    }

    return {
      status: databaseStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      port,
      database: databaseStatus,
      dbService: dbHealth,
    };
  });

  // Get all items from DB service
  fastify.get('/api/items', async (_request, reply) => {
    try {
      const res = await fetch(`${dbServiceUrl}/items`);
      if (!res.ok) {
        return reply.status(res.status).send(await res.text());
      }
      const data: Item[] = await res.json();
      return reply.send(data);
    } catch (err) {
      return reply.status(502).send({ error: 'Failed to connect to Database Service', details: String(err) });
    }
  });

  // Get item by ID from DB service
  fastify.get<{ Params: { id: string } }>('/api/items/:id', async (request, reply) => {
    try {
      const res = await fetch(`${dbServiceUrl}/items/${request.params.id}`);
      const data = await res.json();
      return reply.status(res.status).send(data);
    } catch (err) {
      return reply.status(502).send({ error: 'Failed to connect to Database Service', details: String(err) });
    }
  });

  // Create item via DB service
  fastify.post<{ Body: CreateItemDto }>('/api/items', async (request, reply) => {
    const { title, description } = request.body;
    if (!title || typeof title !== 'string') {
      return reply.status(400).send({ error: 'Title is required' });
    }

    try {
      const res = await fetch(`${dbServiceUrl}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      return reply.status(res.status).send(data);
    } catch (err) {
      return reply.status(502).send({ error: 'Failed to connect to Database Service', details: String(err) });
    }
  });

  // Update item via DB service
  fastify.patch<{ Params: { id: string }; Body: UpdateItemDto }>('/api/items/:id', async (request, reply) => {
    try {
      const res = await fetch(`${dbServiceUrl}/items/${request.params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body),
      });
      const data = await res.json();
      return reply.status(res.status).send(data);
    } catch (err) {
      return reply.status(502).send({ error: 'Failed to connect to Database Service', details: String(err) });
    }
  });

  // Delete item via DB service
  fastify.delete<{ Params: { id: string } }>('/api/items/:id', async (request, reply) => {
    try {
      const res = await fetch(`${dbServiceUrl}/items/${request.params.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      return reply.status(res.status).send(data);
    } catch (err) {
      return reply.status(502).send({ error: 'Failed to connect to Database Service', details: String(err) });
    }
  });

  return fastify;
}

if (require.main === module || process.env.NODE_ENV !== 'test') {
  const app = buildApp();
  app.listen({ port, host }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`🚀 Backend API server listening at ${address}`);
    console.log(`🔗 Database Service URL: ${dbServiceUrl}`);
  });
}
