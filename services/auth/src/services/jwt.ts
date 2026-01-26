import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { TokenPayload, RefreshTokenPayload, AuthToken, UserSession } from '../types/auth';
import redisService from './redis';

class JWTService {
  generateTokens(userId: string, email: string, roles: string[]): AuthToken {
    const sessionId = uuidv4();
    const now = Math.floor(Date.now() / 1000);
    
    const accessTokenPayload: TokenPayload = {
      userId,
      email,
      roles,
      sessionId,
      iat: now,
      exp: now + this.parseExpirationTime(config.jwtExpiresIn),
    };

    const refreshTokenPayload: RefreshTokenPayload = {
      userId,
      sessionId,
      iat: now,
      exp: now + this.parseExpirationTime(config.jwtRefreshExpiresIn),
    };

    const accessToken = jwt.sign(accessTokenPayload, config.jwtSecret);
    const refreshToken = jwt.sign(refreshTokenPayload, config.jwtRefreshSecret);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpirationTime(config.jwtExpiresIn),
      tokenType: 'Bearer',
    };
  }

  async validateToken(token: string): Promise<UserSession | null> {
    try {
      const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
      
      // Check if token is blacklisted
      const isBlacklisted = await redisService.isTokenBlacklisted(payload.sessionId);
      if (isBlacklisted) {
        return null;
      }

      // Check if session exists in Redis
      const sessionData = await redisService.getSession(payload.sessionId);
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
    } catch (error) {
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthToken | null> {
    try {
      const payload = jwt.verify(refreshToken, config.jwtRefreshSecret) as RefreshTokenPayload;
      
      // Check if refresh token is valid in Redis
      const isValid = await redisService.isRefreshTokenValid(payload.userId, payload.sessionId);
      if (!isValid) {
        return null;
      }

      // Get user session data to generate new tokens
      const sessionData = await redisService.getSession(payload.sessionId);
      if (!sessionData) {
        return null;
      }

      // Generate new tokens
      const newTokens = this.generateTokens(
        payload.userId,
        sessionData.email,
        sessionData.roles
      );

      // Store new refresh token and invalidate old one
      await redisService.deleteRefreshToken(payload.userId, payload.sessionId);
      await redisService.setRefreshToken(
        payload.userId,
        this.extractSessionId(newTokens.refreshToken),
        this.parseExpirationTime(config.jwtRefreshExpiresIn)
      );

      return newTokens;
    } catch (error) {
      return null;
    }
  }

  async invalidateToken(token: string): Promise<void> {
    try {
      const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
      const remainingTime = payload.exp - Math.floor(Date.now() / 1000);
      
      if (remainingTime > 0) {
        await redisService.setBlacklistedToken(payload.sessionId, remainingTime);
        await redisService.deleteSession(payload.sessionId);
        await redisService.deleteRefreshToken(payload.userId, payload.sessionId);
      }
    } catch (error) {
      // Token is already invalid, nothing to do
    }
  }

  private parseExpirationTime(timeString: string): number {
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

  private extractSessionId(token: string): string {
    try {
      const payload = jwt.decode(token) as any;
      return payload.sessionId;
    } catch {
      return '';
    }
  }
}

export const jwtService = new JWTService();
export default jwtService;