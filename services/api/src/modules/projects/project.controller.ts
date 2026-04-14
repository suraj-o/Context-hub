import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { projectService } from './project.service.js';

export async function projectRoutes(server: FastifyInstance) {
  server.addHook('preHandler', server.authenticate);

  server.post('/', async (request: FastifyRequest<{ Body: { workspaceId: string, name: string, repositoryUrl?: string } }>, reply: FastifyReply) => {
    const userId = (request.user as any).id;
    const { workspaceId, name, repositoryUrl } = request.body;
    return projectService.create(workspaceId, userId, name, repositoryUrl);
  });

  server.get('/workspace/:workspaceId', async (request: FastifyRequest<{ Params: { workspaceId: string } }>, reply: FastifyReply) => {
    const userId = (request.user as any).id;
    return projectService.list(request.params.workspaceId, userId);
  });

  server.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = (request.user as any).id;
    const project = await projectService.getById(request.params.id, userId);
    if (!project) return reply.status(404).send({ message: 'Project not found' });
    return project;
  });

  server.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = (request.user as any).id;
    await projectService.delete(request.params.id, userId);
    return { message: 'Project deleted' };
  });
}
