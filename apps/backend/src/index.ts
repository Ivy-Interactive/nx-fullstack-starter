import * as dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { db, sqlite } from './db';
import { items } from './db/schema';
import { eq } from 'drizzle-orm';
import type { HealthResponse, CreateItemDto, UpdateItemDto } from '@proj/shared';

const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST || '0.0.0.0';

export function buildApp() {
  const fastify = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  });

  fastify.register(cors, {
    origin: true,
  });

  // Health endpoint
  fastify.get<{ Reply: HealthResponse }>('/api/health', async () => {
    let dbStatus: 'connected' | 'disconnected' = 'disconnected';
    try {
      const check = sqlite.prepare('SELECT 1 as alive').get() as { alive: number };
      if (check.alive === 1) dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      port,
      database: dbStatus,
    };
  });

  // Get all items
  fastify.get('/api/items', async () => {
    const allItems = await db.select().from(items);
    return allItems;
  });

  // Get item by ID
  fastify.get<{ Params: { id: string } }>('/api/items/:id', async (request, reply) => {
    const id = Number(request.params.id);
    const result = await db.select().from(items).where(eq(items.id, id));
    if (result.length === 0) {
      return reply.status(404).send({ error: 'Item not found' });
    }
    return result[0];
  });

  // Create item
  fastify.post<{ Body: CreateItemDto }>('/api/items', async (request, reply) => {
    const { title, description } = request.body;
    if (!title || typeof title !== 'string') {
      return reply.status(400).send({ error: 'Title is required' });
    }

    const inserted = await db
      .insert(items)
      .values({
        title,
        description: description || '',
        completed: false,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return reply.status(201).send(inserted[0]);
  });

  // Update item
  fastify.patch<{ Params: { id: string }; Body: UpdateItemDto }>('/api/items/:id', async (request, reply) => {
    const id = Number(request.params.id);
    const { title, description, completed } = request.body;

    const existing = await db.select().from(items).where(eq(items.id, id));
    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Item not found' });
    }

    const updated = await db
      .update(items)
      .set({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(completed !== undefined && { completed }),
      })
      .where(eq(items.id, id))
      .returning();

    return updated[0];
  });

  // Delete item
  fastify.delete<{ Params: { id: string } }>('/api/items/:id', async (request, reply) => {
    const id = Number(request.params.id);
    const existing = await db.select().from(items).where(eq(items.id, id));
    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Item not found' });
    }

    await db.delete(items).where(eq(items.id, id));
    return { success: true, id };
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
    console.log(`🚀 Backend server listening at ${address}`);
    console.log(`📊 SQLite database connected: ${process.env.DATABASE_URL || './data/app.db'}`);
  });
}
