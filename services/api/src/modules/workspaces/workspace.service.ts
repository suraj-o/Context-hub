import prisma from '../../infrastructure/database.js';

export class WorkspaceService {
  async create(userId: string, name: string) {
    return prisma.workspace.create({
      data: {
        userId,
        name,
      },
    });
  }

  async list(userId: string) {
    return prisma.workspace.findMany({
      where: { userId },
      include: { _count: { select: { projects: true } } },
    });
  }

  async getById(id: string, userId: string) {
    return prisma.workspace.findFirst({
      where: { id, userId },
      include: { projects: true },
    });
  }

  async update(id: string, userId: string, name: string) {
    return prisma.workspace.updateMany({
      where: { id, userId },
      data: { name },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.workspace.deleteMany({
      where: { id, userId },
    });
  }
}

export const workspaceService = new WorkspaceService();
