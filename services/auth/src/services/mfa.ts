import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import config from '../config';
import { MFASetupResponse } from '../types/auth';

class MFAService {
  generateSecret(userEmail: string): { secret: string; otpauthUrl: string } {
    const secret = speakeasy.generateSecret({
      name: userEmail,
      issuer: config.mfa.issuer,
      length: 32,
    });

    return {
      secret: secret.base32!,
      otpauthUrl: secret.otpauth_url!,
    };
  }

  async setupMFA(userEmail: string): Promise<MFASetupResponse> {
    const { secret, otpauthUrl } = this.generateSecret(userEmail);
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);
    
    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: config.mfa.window,
    });
  }

  verifyBackupCode(storedBackupCodes: string[], providedCode: string): boolean {
    const index = storedBackupCodes.indexOf(providedCode);
    if (index !== -1) {
      // Remove used backup code
      storedBackupCodes.splice(index, 1);
      return true;
    }
    return false;
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(this.generateRandomCode());
    }
    return codes;
  }

  private generateRandomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const mfaService = new MFAService();
export default mfaService;