export declare class EncryptionService {
    private readonly secretKey;
    constructor(secretKeyStr: string);
    encrypt(text: string): string;
    decrypt(encryptedText: string): string;
}
export declare const encryptionService: EncryptionService;
