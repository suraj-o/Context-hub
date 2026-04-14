import prisma from '../../infrastructure/database.js';
import { encryptionService } from '../../infrastructure/encryption.js';

export class UserService {
  async getSettings(userId: string) {
    return prisma.userSettings.findUnique({
      where: { userId },
    });
  }

  async updateSettings(userId: string, data: any) {
    return prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  async setApiKey(userId: string, provider: string, key: string) {
    const encryptedKey = encryptionService.encrypt(key);
    return prisma.userApiKey.upsert({
      where: {
        userId_provider: { userId, provider },
      },
      update: { encryptedKey },
      create: { userId, provider, encryptedKey },
    });
  }

  async getApiKey(userId: string, provider: string): Promise<string | null> {
    const apiRecord = await prisma.userApiKey.findUnique({
      where: {
        userId_provider: { userId, provider },
      },
    });

    if (!apiRecord) return null;
    return encryptionService.decrypt(apiRecord.encryptedKey);
  }

  async listApiKeys(userId: string) {
    const keys = await prisma.userApiKey.findMany({
      where: { userId },
      select: { provider: true, createdAt: true },
    });
    return keys;
  }
}

export const userService = new UserService();
