import { AuthToken, UserSession } from '../types/auth';
declare class JWTService {
    generateTokens(userId: string, email: string, roles: string[]): AuthToken;
    validateToken(token: string): Promise<UserSession | null>;
    refreshToken(refreshToken: string): Promise<AuthToken | null>;
    invalidateToken(token: string): Promise<void>;
    private parseExpirationTime;
    private extractSessionId;
}
export declare const jwtService: JWTService;
export default jwtService;
//# sourceMappingURL=jwt.d.ts.map