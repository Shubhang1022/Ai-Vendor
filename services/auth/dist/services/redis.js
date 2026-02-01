"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = void 0;
const mock_redis_1 = __importDefault(require("./mock-redis"));
class RedisService {
    client = null;
    isConnected = false;
    useMock = false;
    constructor() {
        // Start with mock service by default if Redis is not available
        this.useMock = true;
        console.log('Starting with mock Redis service (in-memory storage)');
    }
    async connect() {
        if (this.useMock) {
            await mock_redis_1.default.connect();
            return;
        }
    }
    async disconnect() {
        if (this.useMock) {
            await mock_redis_1.default.disconnect();
            return;
        }
        if (this.isConnected && this.client) {
            await this.client.disconnect();
            this.isConnected = false;
        }
    }
    async setSession(sessionId, sessionData, expirationSeconds) {
        if (this.useMock) {
            return mock_redis_1.default.setSession(sessionId, sessionData, expirationSeconds);
        }
        if (!this.client)
            throw new Error('Redis client not initialized');
        await this.client.setEx(`session:${sessionId}`, expirationSeconds, JSON.stringify(sessionData));
    }
    async getSession(sessionId) {
        if (this.useMock) {
            return mock_redis_1.default.getSession(sessionId);
        }
        if (!this.client)
            throw new Error('Redis client not initialized');
        const data = await this.client.get(`session:${sessionId}`);
        return data ? JSON.parse(data) : null;
    }
    async deleteSession(sessionId) {
        if (this.useMock) {
            return mock_redis_1.default.deleteSession(sessionId);
        }
        if (!this.client)
            throw new Error('Redis client not initialized');
        await this.client.del(`session:${sessionId}`);
    }
    async setBlacklistedToken(tokenId, expirationSeconds) {
        if (this.useMock) {
            return mock_redis_1.default.setBlacklistedToken(tokenId, expirationSeconds);
        }
        if (!this.client)
            throw new Error('Redis client not initialized');
        await this.client.setEx(`blacklist:${tokenId}`, expirationSeconds, 'true');
    }
    async isTokenBlacklisted(tokenId) {
        if (this.useMock) {
            return mock_redis_1.default.isTokenBlacklisted(tokenId);
        }
        if (!this.client)
            throw new Error('Redis client not initialized');
        const result = await this.client.get(`blacklist:${tokenId}`);
        return result === 'true';
    }
    async setRefreshToken(userId, tokenId, expirationSeconds) {
        if (this.useMock) {
            return mock_redis_1.default.setRefreshToken(userId, tokenId, expirationSeconds);
        }
        if (!this.client)
            throw new Error('Redis client not initialized');
        await this.client.setEx(`refresh:${userId}:${tokenId}`, expirationSeconds, 'true');
    }
    async isRefreshTokenValid(userId, tokenId) {
        if (this.useMock) {
            return mock_redis_1.default.isRefreshTokenValid(userId, tokenId);
        }
        if (!this.client)
            throw new Error('Redis client not initialized');
        const result = await this.client.get(`refresh:${userId}:${tokenId}`);
        return result === 'true';
    }
    async deleteRefreshToken(userId, tokenId) {
        if (this.useMock) {
            return mock_redis_1.default.deleteRefreshToken(userId, tokenId);
        }
        if (!this.client)
            throw new Error('Redis client not initialized');
        await this.client.del(`refresh:${userId}:${tokenId}`);
    }
    async deleteAllUserRefreshTokens(userId) {
        if (this.useMock) {
            return mock_redis_1.default.deleteAllUserRefreshTokens(userId);
        }
        if (!this.client)
            throw new Error('Redis client not initialized');
        const keys = await this.client.keys(`refresh:${userId}:*`);
        if (keys.length > 0) {
            await this.client.del(keys);
        }
    }
}
exports.redisService = new RedisService();
exports.default = exports.redisService;
//# sourceMappingURL=redis.js.map