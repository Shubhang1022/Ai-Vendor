declare class RedisService {
    private client;
    private isConnected;
    private useMock;
    constructor();
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
}
export declare const redisService: RedisService;
export default redisService;
//# sourceMappingURL=redis.d.ts.map