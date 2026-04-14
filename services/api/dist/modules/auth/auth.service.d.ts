import { SignupInput, LoginInput } from './auth.schema.js';
export declare class AuthService {
    signup(input: SignupInput): Promise<{
        settings: {
            id: string;
            theme: string;
            preferences: import("@prisma/client/runtime/library").JsonValue;
            userId: string;
        } | null;
    } & {
        email: string;
        name: string | null;
        id: string;
        passwordHash: string | null;
        hashedApiKey: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(input: LoginInput): Promise<{
        settings: {
            id: string;
            theme: string;
            preferences: import("@prisma/client/runtime/library").JsonValue;
            userId: string;
        } | null;
    } & {
        email: string;
        name: string | null;
        id: string;
        passwordHash: string | null;
        hashedApiKey: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare const authService: AuthService;
