"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const config_1 = __importDefault(require("../config"));
const redis_1 = __importDefault(require("./redis"));
class JWTService {
    generateTokens(userId, email, roles) {
        const sessionId = (0, uuid_1.v4)();
        const now = Math.floor(Date.now() / 1000);
        const accessTokenPayload = {
            userId,
            email,
            roles,
            sessionId,
            iat: now,
            exp: now + this.parseExpirationTime(config_1.default.jwtExpiresIn),
        };
        const refreshTokenPayload = {
            userId,
            sessionId,
            iat: now,
            exp: now + this.parseExpirationTime(config_1.default.jwtRefreshExpiresIn),
        };
        const accessToken = jsonwebtoken_1.default.sign(accessTokenPayload, config_1.default.jwtSecret);
        const refreshToken = jsonwebtoken_1.default.sign(refreshTokenPayload, config_1.default.jwtRefreshSecret);
        return {
            accessToken,
            refreshToken,
            expiresIn: this.parseExpirationTime(config_1.default.jwtExpiresIn),
            tokenType: 'Bearer',
        };
    }
    async validateToken(token) {
        try {
            const payload = jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
            // Check if token is blacklisted
            const isBlacklisted = await redis_1.default.isTokenBlacklisted(payload.sessionId);
            if (isBlacklisted) {
                return null;
            }
            // Check if session exists in Redis
            const sessionData = await redis_1.default.getSession(payload.sessionId);
            if (!sessionData) {
                return null;
            }
            return {
                userId: payload.userId,
                email: payload.email,
                roles: payload.roles.map(roleName => ({ id: roleName, name: roleName, permissions: [] })),
                permissions: [], // Will be populated by RBAC service
                sessionId: payload.sessionId,
                issuedAt: payload.iat,
                expiresAt: payload.exp,
            };
        }
        catch (error) {
            return null;
        }
    }
    async refreshToken(refreshToken) {
        try {
            const payload = jsonwebtoken_1.default.verify(refreshToken, config_1.default.jwtRefreshSecret);
            // Check if refresh token is valid in Redis
            const isValid = await redis_1.default.isRefreshTokenValid(payload.userId, payload.sessionId);
            if (!isValid) {
                return null;
            }
            // Get user session data to generate new tokens
            const sessionData = await redis_1.default.getSession(payload.sessionId);
            if (!sessionData) {
                return null;
            }
            // Generate new tokens with new session ID
            const newTokens = this.generateTokens(payload.userId, sessionData.email, sessionData.roles);
            // Extract new session ID from the new access token
            const newSessionId = this.extractSessionId(newTokens.accessToken);
            // Store new session data
            await redis_1.default.setSession(newSessionId, sessionData, this.parseExpirationTime(config_1.default.jwtExpiresIn));
            // Store new refresh token and invalidate old one
            await redis_1.default.deleteRefreshToken(payload.userId, payload.sessionId);
            await redis_1.default.deleteSession(payload.sessionId);
            await redis_1.default.setRefreshToken(payload.userId, newSessionId, this.parseExpirationTime(config_1.default.jwtRefreshExpiresIn));
            return newTokens;
        }
        catch (error) {
            return null;
        }
    }
    async invalidateToken(token) {
        try {
            const payload = jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
            const remainingTime = payload.exp - Math.floor(Date.now() / 1000);
            if (remainingTime > 0) {
                await redis_1.default.setBlacklistedToken(payload.sessionId, remainingTime);
                await redis_1.default.deleteSession(payload.sessionId);
                await redis_1.default.deleteRefreshToken(payload.userId, payload.sessionId);
            }
        }
        catch (error) {
            // Token is already invalid, nothing to do
        }
    }
    parseExpirationTime(timeString) {
        const unit = timeString.slice(-1);
        const value = parseInt(timeString.slice(0, -1), 10);
        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 60 * 60;
            case 'd': return value * 60 * 60 * 24;
            default: return 900; // 15 minutes default
        }
    }
    extractSessionId(token) {
        try {
            const payload = jsonwebtoken_1.default.decode(token);
            return payload.sessionId;
        }
        catch {
            return '';
        }
    }
}
exports.jwtService = new JWTService();
exports.default = exports.jwtService;
//# sourceMappingURL=jwt.js.map