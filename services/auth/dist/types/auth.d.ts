export interface LoginCredentials {
    email: string;
    password: string;
    totpCode?: string;
}
export interface AuthToken {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
}
export interface UserSession {
    userId: string;
    email: string;
    roles: Role[];
    permissions: Permission[];
    sessionId: string;
    issuedAt: number;
    expiresAt: number;
}
export interface User {
    id: string;
    email: string;
    passwordHash: string;
    roles: Role[];
    mfaEnabled: boolean;
    mfaSecret?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Role {
    id: string;
    name: string;
    permissions: Permission[];
}
export interface Permission {
    id: string;
    resource: string;
    action: string;
    conditions?: Record<string, any>;
}
export interface MFASetupResponse {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
}
export interface TokenPayload {
    userId: string;
    email: string;
    roles: string[];
    sessionId: string;
    iat: number;
    exp: number;
}
export interface RefreshTokenPayload {
    userId: string;
    sessionId: string;
    iat: number;
    exp: number;
}
//# sourceMappingURL=auth.d.ts.map