export declare class ProjectService {
    create(workspaceId: string, userId: string, name: string, repositoryUrl?: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        repositoryUrl: string | null;
        workspaceId: string;
    }>;
    list(workspaceId: string, userId: string): Promise<({
        _count: {
            contextEntries: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        repositoryUrl: string | null;
        workspaceId: string;
    })[]>;
    getById(id: string, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        repositoryUrl: string | null;
        workspaceId: string;
    } | null>;
    delete(id: string, userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
export declare const projectService: ProjectService;
