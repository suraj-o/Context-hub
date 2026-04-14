export declare class WorkspaceService {
    create(userId: string, name: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
    }>;
    list(userId: string): Promise<({
        _count: {
            projects: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
    })[]>;
    getById(id: string, userId: string): Promise<({
        projects: {
            name: string;
            id: string;
            createdAt: Date;
            repositoryUrl: string | null;
            workspaceId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
    }) | null>;
    update(id: string, userId: string, name: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    delete(id: string, userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
export declare const workspaceService: WorkspaceService;
