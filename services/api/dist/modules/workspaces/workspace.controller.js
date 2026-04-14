import { workspaceService } from './workspace.service.js';
export async function workspaceRoutes(server) {
    server.addHook('preHandler', server.authenticate);
    server.post('/', async (request, reply) => {
        const userId = request.user.id;
        return workspaceService.create(userId, request.body.name);
    });
    server.get('/', async (request, reply) => {
        const userId = request.user.id;
        return workspaceService.list(userId);
    });
    server.get('/:id', async (request, reply) => {
        const userId = request.user.id;
        const workspace = await workspaceService.getById(request.params.id, userId);
        if (!workspace)
            return reply.status(404).send({ message: 'Workspace not found' });
        return workspace;
    });
    server.delete('/:id', async (request, reply) => {
        const userId = request.user.id;
        await workspaceService.delete(request.params.id, userId);
        return { message: 'Workspace deleted' };
    });
}
