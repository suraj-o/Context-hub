import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

export class EncryptionService {
  private readonly secretKey: Buffer;

  constructor(secretKeyStr: string) {
    if (!secretKeyStr) {
      throw new Error('MASTER_ENCRYPTION_KEY is required');
    }
    // Ensure key is 32 bytes
    this.secretKey = crypto.createHash('sha256').update(secretKeyStr).digest();
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.secretKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Format: iv:tag:encrypted
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, tagHex, contentHex] = encryptedText.split(':');
    if (!ivHex || !tagHex || !contentHex) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, this.secretKey, iv);
    
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(contentHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Singleton instance for the app
const MASTER_KEY = process.env.MASTER_ENCRYPTION_KEY || 'default-secret-key-change-me-in-prod';
export const encryptionService = new EncryptionService(MASTER_KEY);
