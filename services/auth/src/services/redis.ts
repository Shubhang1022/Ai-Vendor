import { createClient, RedisClientType } from 'redis';
import config from '../config';

class RedisService {
  private client: RedisClientType;
  private isConnected = false;

  constructor() {
    this.client = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
      password: config.redis.password,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.isConnected = true;
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  async setSession(sessionId: string, sessionData: any, expirationSeconds: number): Promise<void> {
    await this.client.setEx(
      `session:${sessionId}`,
      expirationSeconds,
      JSON.stringify(sessionData)
    );
  }

  async getSession(sessionId: string): Promise<any | null> {
    const data = await this.client.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.client.del(`session:${sessionId}`);
  }

  async setBlacklistedToken(tokenId: string, expirationSeconds: number): Promise<void> {
    await this.client.setEx(`blacklist:${tokenId}`, expirationSeconds, 'true');
  }

  async isTokenBlacklisted(tokenId: string): Promise<boolean> {
    const result = await this.client.get(`blacklist:${tokenId}`);
    return result === 'true';
  }

  async setRefreshToken(userId: string, tokenId: string, expirationSeconds: number): Promise<void> {
    await this.client.setEx(
      `refresh:${userId}:${tokenId}`,
      expirationSeconds,
      'true'
    );
  }

  async isRefreshTokenValid(userId: string, tokenId: string): Promise<boolean> {
    const result = await this.client.get(`refresh:${userId}:${tokenId}`);
    return result === 'true';
  }

  async deleteRefreshToken(userId: string, tokenId: string): Promise<void> {
    await this.client.del(`refresh:${userId}:${tokenId}`);
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    const keys = await this.client.keys(`refresh:${userId}:*`);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }
}

export const redisService = new RedisService();
export default redisService;