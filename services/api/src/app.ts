import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { authRoutes } from './modules/auth/auth.controller.js';
import { workspaceRoutes } from './modules/workspaces/workspace.controller.js';
import { projectRoutes } from './modules/projects/project.controller.js';
import { chatRoutes } from './modules/chat/chat.controller.js';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export async function buildApp() {
  const server = Fastify({
    logger: true,
  });

  // Plugins
  server.register(fastifyCors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  server.register(fastifyCookie);

  server.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'super-secret-key-change-me',
    cookie: {
      cookieName: 'token',
      signed: false,
    },
  });

  // Auth Decorator
  server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ message: 'Unauthorized' });
    }
  });

  // Routes
  server.register(authRoutes, { prefix: '/api/auth' });
  server.register(workspaceRoutes, { prefix: '/api/workspaces' });
  server.register(projectRoutes, { prefix: '/api/projects' });
  server.register(chatRoutes, { prefix: '/api/chat' });

  // Health check
  server.get('/health', async () => {
    return { status: 'ok' };
  });

  return server;
}

