"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockRedisService = void 0;
// Mock Redis service for demonstration when Redis is not available
class MockRedisService {
    storage = new Map();
    isConnected = true;
    async connect() {
        console.log('Mock Redis: Connected (in-memory storage)');
        this.isConnected = true;
    }
    async disconnect() {
        console.log('Mock Redis: Disconnected');
        this.isConnected = false;
        this.storage.clear();
    }
    async setSession(sessionId, sessionData, expirationSeconds) {
        const expiry = Date.now() + (expirationSeconds * 1000);
        this.storage.set(`session:${sessionId}`, {
            value: JSON.stringify(sessionData),
            expiry
        });
    }
    async getSession(sessionId) {
        const entry = this.storage.get(`session:${sessionId}`);
        if (!entry)
            return null;
        if (entry.expiry && Date.now() > entry.expiry) {
            this.storage.delete(`session:${sessionId}`);
            return null;
        }
        return JSON.parse(entry.value);
    }
    async deleteSession(sessionId) {
        this.storage.delete(`session:${sessionId}`);
    }
    async setBlacklistedToken(tokenId, expirationSeconds) {
        const expiry = Date.now() + (expirationSeconds * 1000);
        this.storage.set(`blacklist:${tokenId}`, {
            value: 'true',
            expiry
        });
    }
    async isTokenBlacklisted(tokenId) {
        const entry = this.storage.get(`blacklist:${tokenId}`);
        if (!entry)
            return false;
        if (entry.expiry && Date.now() > entry.expiry) {
            this.storage.delete(`blacklist:${tokenId}`);
            return false;
        }
        return entry.value === 'true';
    }
    async setRefreshToken(userId, tokenId, expirationSeconds) {
        const expiry = Date.now() + (expirationSeconds * 1000);
        this.storage.set(`refresh:${userId}:${tokenId}`, {
            value: 'true',
            expiry
        });
    }
    async isRefreshTokenValid(userId, tokenId) {
        const entry = this.storage.get(`refresh:${userId}:${tokenId}`);
        if (!entry)
            return false;
        if (entry.expiry && Date.now() > entry.expiry) {
            this.storage.delete(`refresh:${userId}:${tokenId}`);
            return false;
        }
        return entry.value === 'true';
    }
    async deleteRefreshToken(userId, tokenId) {
        this.storage.delete(`refresh:${userId}:${tokenId}`);
    }
    async deleteAllUserRefreshTokens(userId) {
        const keysToDelete = [];
        for (const key of this.storage.keys()) {
            if (key.startsWith(`refresh:${userId}:`)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.storage.delete(key));
    }
    // Cleanup expired entries periodically
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.storage.entries()) {
            if (entry.expiry && now > entry.expiry) {
                this.storage.delete(key);
            }
        }
    }
    constructor() {
        // Run cleanup every 5 minutes
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
}
exports.mockRedisService = new MockRedisService();
exports.default = exports.mockRedisService;
//# sourceMappingURL=mock-redis.js.map