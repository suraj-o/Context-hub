export declare class UserService {
    getSettings(userId: string): Promise<{
        id: string;
        theme: string;
        preferences: import("@prisma/client/runtime/library").JsonValue;
        userId: string;
    } | null>;
    updateSettings(userId: string, data: any): Promise<{
        id: string;
        theme: string;
        preferences: import("@prisma/client/runtime/library").JsonValue;
        userId: string;
    }>;
    setApiKey(userId: string, provider: string, key: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        provider: string;
        encryptedKey: string;
    }>;
    getApiKey(userId: string, provider: string): Promise<string | null>;
    listApiKeys(userId: string): Promise<{
        createdAt: Date;
        provider: string;
    }[]>;
}
export declare const userService: UserService;
