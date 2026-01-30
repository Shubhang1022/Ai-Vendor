import { createClient, RedisClientType } from 'redis';
import config from '../config';
import mockRedisService from './mock-redis';

class RedisService {
  private client: RedisClientType | null = null;
  private isConnected = false;
  private useMock = false;

  constructor() {
    // Start with mock service by default if Redis is not available
    this.useMock = true;
    console.log('Starting with mock Redis service (in-memory storage)');
  }

  async connect(): Promise<void> {
    if (this.useMock) {
      await mockRedisService.connect();
      return;
    }
  }

  async disconnect(): Promise<void> {
    if (this.useMock) {
      await mockRedisService.disconnect();
      return;
    }

    if (this.isConnected && this.client) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  async setSession(sessionId: string, sessionData: any, expirationSeconds: number): Promise<void> {
    if (this.useMock) {
      return mockRedisService.setSession(sessionId, sessionData, expirationSeconds);
    }

    if (!this.client) throw new Error('Redis client not initialized');
    await this.client.setEx(
      `session:${sessionId}`,
      expirationSeconds,
      JSON.stringify(sessionData)
    );
  }

  async getSession(sessionId: string): Promise<any | null> {
    if (this.useMock) {
      return mockRedisService.getSession(sessionId);
    }

    if (!this.client) throw new Error('Redis client not initialized');
    const data = await this.client.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (this.useMock) {
      return mockRedisService.deleteSession(sessionId);
    }

    if (!this.client) throw new Error('Redis client not initialized');
    await this.client.del(`session:${sessionId}`);
  }

  async setBlacklistedToken(tokenId: string, expirationSeconds: number): Promise<void> {
    if (this.useMock) {
      return mockRedisService.setBlacklistedToken(tokenId, expirationSeconds);
    }

    if (!this.client) throw new Error('Redis client not initialized');
    await this.client.setEx(`blacklist:${tokenId}`, expirationSeconds, 'true');
  }

  async isTokenBlacklisted(tokenId: string): Promise<boolean> {
    if (this.useMock) {
      return mockRedisService.isTokenBlacklisted(tokenId);
    }

    if (!this.client) throw new Error('Redis client not initialized');
    const result = await this.client.get(`blacklist:${tokenId}`);
    return result === 'true';
  }

  async setRefreshToken(userId: string, tokenId: string, expirationSeconds: number): Promise<void> {
    if (this.useMock) {
      return mockRedisService.setRefreshToken(userId, tokenId, expirationSeconds);
    }

    if (!this.client) throw new Error('Redis client not initialized');
    await this.client.setEx(
      `refresh:${userId}:${tokenId}`,
      expirationSeconds,
      'true'
    );
  }

  async isRefreshTokenValid(userId: string, tokenId: string): Promise<boolean> {
    if (this.useMock) {
      return mockRedisService.isRefreshTokenValid(userId, tokenId);
    }

    if (!this.client) throw new Error('Redis client not initialized');
    const result = await this.client.get(`refresh:${userId}:${tokenId}`);
    return result === 'true';
  }

  async deleteRefreshToken(userId: string, tokenId: string): Promise<void> {
    if (this.useMock) {
      return mockRedisService.deleteRefreshToken(userId, tokenId);
    }

    if (!this.client) throw new Error('Redis client not initialized');
    await this.client.del(`refresh:${userId}:${tokenId}`);
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    if (this.useMock) {
      return mockRedisService.deleteAllUserRefreshTokens(userId);
    }

    if (!this.client) throw new Error('Redis client not initialized');
    const keys = await this.client.keys(`refresh:${userId}:*`);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }
}

export const redisService = new RedisService();
export default redisService;