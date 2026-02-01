import { MFASetupResponse } from '../types/auth';
declare class MFAService {
    generateSecret(userEmail: string): {
        secret: string;
        otpauthUrl: string;
    };
    setupMFA(userEmail: string): Promise<MFASetupResponse>;
    verifyToken(secret: string, token: string): boolean;
    verifyBackupCode(storedBackupCodes: string[], providedCode: string): boolean;
    private generateBackupCodes;
    private generateRandomCode;
}
export declare const mfaService: MFAService;
export default mfaService;
//# sourceMappingURL=mfa.d.ts.map