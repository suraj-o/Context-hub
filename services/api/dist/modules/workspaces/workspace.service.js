import prisma from '../../infrastructure/database.js';
export class WorkspaceService {
    async create(userId, name) {
        return prisma.workspace.create({
            data: {
                userId,
                name,
            },
        });
    }
    async list(userId) {
        return prisma.workspace.findMany({
            where: { userId },
            include: { _count: { select: { projects: true } } },
        });
    }
    async getById(id, userId) {
        return prisma.workspace.findFirst({
            where: { id, userId },
            include: { projects: true },
        });
    }
    async update(id, userId, name) {
        return prisma.workspace.updateMany({
            where: { id, userId },
            data: { name },
        });
    }
    async delete(id, userId) {
        return prisma.workspace.deleteMany({
            where: { id, userId },
        });
    }
}
export const workspaceService = new WorkspaceService();
