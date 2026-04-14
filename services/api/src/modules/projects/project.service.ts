import prisma from '../../infrastructure/database.js';

export class ProjectService {
  async create(workspaceId: string, userId: string, name: string, repositoryUrl?: string) {
    // Ensure workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
    });

    if (!workspace) {
      throw new Error('Workspace not found or unauthorized');
    }

    return prisma.project.create({
      data: {
        workspaceId,
        name,
        repositoryUrl,
      },
    });
  }

  async list(workspaceId: string, userId: string) {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
    });

    if (!workspace) {
      throw new Error('Workspace not found or unauthorized');
    }

    return prisma.project.findMany({
      where: { workspaceId },
      include: { _count: { select: { contextEntries: true } } },
    });
  }

  async getById(id: string, userId: string) {
    return prisma.project.findFirst({
      where: {
        id,
        workspace: { userId },
      },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.project.deleteMany({
      where: {
        id,
        workspace: { userId },
      },
    });
  }
}

export const projectService = new ProjectService();
