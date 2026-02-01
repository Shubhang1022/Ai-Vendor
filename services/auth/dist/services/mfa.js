"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mfaService = void 0;
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const config_1 = __importDefault(require("../config"));
class MFAService {
    generateSecret(userEmail) {
        const secret = speakeasy_1.default.generateSecret({
            name: userEmail,
            issuer: config_1.default.mfa.issuer,
            length: 32,
        });
        return {
            secret: secret.base32,
            otpauthUrl: secret.otpauth_url,
        };
    }
    async setupMFA(userEmail) {
        const { secret, otpauthUrl } = this.generateSecret(userEmail);
        // Generate QR code
        const qrCodeUrl = await qrcode_1.default.toDataURL(otpauthUrl);
        // Generate backup codes
        const backupCodes = this.generateBackupCodes();
        return {
            secret,
            qrCodeUrl,
            backupCodes,
        };
    }
    verifyToken(secret, token) {
        return speakeasy_1.default.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: config_1.default.mfa.window,
        });
    }
    verifyBackupCode(storedBackupCodes, providedCode) {
        const index = storedBackupCodes.indexOf(providedCode);
        if (index !== -1) {
            // Remove used backup code
            storedBackupCodes.splice(index, 1);
            return true;
        }
        return false;
    }
    generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < 10; i++) {
            codes.push(this.generateRandomCode());
        }
        return codes;
    }
    generateRandomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
exports.mfaService = new MFAService();
exports.default = exports.mfaService;
//# sourceMappingURL=mfa.js.map