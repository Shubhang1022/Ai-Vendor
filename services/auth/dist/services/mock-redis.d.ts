declare class MockRedisService {
    private storage;
    private isConnected;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    setSession(sessionId: string, sessionData: any, expirationSeconds: number): Promise<void>;
    getSession(sessionId: string): Promise<any | null>;
    deleteSession(sessionId: string): Promise<void>;
    setBlacklistedToken(tokenId: string, expirationSeconds: number): Promise<void>;
    isTokenBlacklisted(tokenId: string): Promise<boolean>;
    setRefreshToken(userId: string, tokenId: string, expirationSeconds: number): Promise<void>;
    isRefreshTokenValid(userId: string, tokenId: string): Promise<boolean>;
    deleteRefreshToken(userId: string, tokenId: string): Promise<void>;
    deleteAllUserRefreshTokens(userId: string): Promise<void>;
    private cleanup;
    constructor();
}
export declare const mockRedisService: MockRedisService;
export default mockRedisService;
//# sourceMappingURL=mock-redis.d.ts.map