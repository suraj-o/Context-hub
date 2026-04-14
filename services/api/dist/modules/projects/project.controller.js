import { projectService } from './project.service.js';
export async function projectRoutes(server) {
    server.addHook('preHandler', server.authenticate);
    server.post('/', async (request, reply) => {
        const userId = request.user.id;
        const { workspaceId, name, repositoryUrl } = request.body;
        return projectService.create(workspaceId, userId, name, repositoryUrl);
    });
    server.get('/workspace/:workspaceId', async (request, reply) => {
        const userId = request.user.id;
        return projectService.list(request.params.workspaceId, userId);
    });
    server.get('/:id', async (request, reply) => {
        const userId = request.user.id;
        const project = await projectService.getById(request.params.id, userId);
        if (!project)
            return reply.status(404).send({ message: 'Project not found' });
        return project;
    });
    server.delete('/:id', async (request, reply) => {
        const userId = request.user.id;
        await projectService.delete(request.params.id, userId);
        return { message: 'Project deleted' };
    });
}
