import { LoginCredentials, AuthToken, User, MFASetupResponse } from '../types/auth';
declare class AuthService {
    private users;
    constructor();
    private initializeDefaultUsers;
    authenticate(credentials: LoginCredentials): Promise<AuthToken | null>;
    refreshToken(refreshToken: string): Promise<AuthToken | null>;
    logout(token: string): Promise<void>;
    setupMFA(userId: string): Promise<MFASetupResponse | null>;
    enableMFA(userId: string, totpCode: string): Promise<boolean>;
    disableMFA(userId: string, totpCode: string): Promise<boolean>;
    createUser(email: string, password: string, roles?: string[]): Promise<User | null>;
    getUserById(userId: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    updateUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean>;
    deactivateUser(userId: string): Promise<boolean>;
    private findUserById;
    private extractSessionId;
    private parseExpirationTime;
}
export declare const authService: AuthService;
export default authService;
//# sourceMappingURL=auth.d.ts.map