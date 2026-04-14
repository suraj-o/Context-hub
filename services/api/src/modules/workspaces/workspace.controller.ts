import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { workspaceService } from './workspace.service.js';

export async function workspaceRoutes(server: FastifyInstance) {
  server.addHook('preHandler', server.authenticate);

  server.post('/', async (request: FastifyRequest<{ Body: { name: string } }>, reply: FastifyReply) => {
    const userId = (request.user as any).id;
    return workspaceService.create(userId, request.body.name);
  });

  server.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request.user as any).id;
    return workspaceService.list(userId);
  });

  server.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = (request.user as any).id;
    const workspace = await workspaceService.getById(request.params.id, userId);
    if (!workspace) return reply.status(404).send({ message: 'Workspace not found' });
    return workspace;
  });

  server.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = (request.user as any).id;
    await workspaceService.delete(request.params.id, userId);
    return { message: 'Workspace deleted' };
  });
}
