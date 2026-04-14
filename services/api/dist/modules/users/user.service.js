import prisma from '../../infrastructure/database.js';
import { encryptionService } from '../../infrastructure/encryption.js';
export class UserService {
    async getSettings(userId) {
        return prisma.userSettings.findUnique({
            where: { userId },
        });
    }
    async updateSettings(userId, data) {
        return prisma.userSettings.upsert({
            where: { userId },
            update: data,
            create: { userId, ...data },
        });
    }
    async setApiKey(userId, provider, key) {
        const encryptedKey = encryptionService.encrypt(key);
        return prisma.userApiKey.upsert({
            where: {
                userId_provider: { userId, provider },
            },
            update: { encryptedKey },
            create: { userId, provider, encryptedKey },
        });
    }
    async getApiKey(userId, provider) {
        const apiRecord = await prisma.userApiKey.findUnique({
            where: {
                userId_provider: { userId, provider },
            },
        });
        if (!apiRecord)
            return null;
        return encryptionService.decrypt(apiRecord.encryptedKey);
    }
    async listApiKeys(userId) {
        const keys = await prisma.userApiKey.findMany({
            where: { userId },
            select: { provider: true, createdAt: true },
        });
        return keys;
    }
}
export const userService = new UserService();
