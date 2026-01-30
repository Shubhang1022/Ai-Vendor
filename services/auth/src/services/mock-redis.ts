// Mock Redis service for demonstration when Redis is not available
class MockRedisService {
  private storage: Map<string, { value: string; expiry?: number }> = new Map();
  private isConnected = true;

  async connect(): Promise<void> {
    console.log('Mock Redis: Connected (in-memory storage)');
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    console.log('Mock Redis: Disconnected');
    this.isConnected = false;
    this.storage.clear();
  }

  async setSession(sessionId: string, sessionData: any, expirationSeconds: number): Promise<void> {
    const expiry = Date.now() + (expirationSeconds * 1000);
    this.storage.set(`session:${sessionId}`, {
      value: JSON.stringify(sessionData),
      expiry
    });
  }

  async getSession(sessionId: string): Promise<any | null> {
    const entry = this.storage.get(`session:${sessionId}`);
    if (!entry) return null;
    
    if (entry.expiry && Date.now() > entry.expiry) {
      this.storage.delete(`session:${sessionId}`);
      return null;
    }
    
    return JSON.parse(entry.value);
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.storage.delete(`session:${sessionId}`);
  }

  async setBlacklistedToken(tokenId: string, expirationSeconds: number): Promise<void> {
    const expiry = Date.now() + (expirationSeconds * 1000);
    this.storage.set(`blacklist:${tokenId}`, {
      value: 'true',
      expiry
    });
  }

  async isTokenBlacklisted(tokenId: string): Promise<boolean> {
    const entry = this.storage.get(`blacklist:${tokenId}`);
    if (!entry) return false;
    
    if (entry.expiry && Date.now() > entry.expiry) {
      this.storage.delete(`blacklist:${tokenId}`);
      return false;
    }
    
    return entry.value === 'true';
  }

  async setRefreshToken(userId: string, tokenId: string, expirationSeconds: number): Promise<void> {
    const expiry = Date.now() + (expirationSeconds * 1000);
    this.storage.set(`refresh:${userId}:${tokenId}`, {
      value: 'true',
      expiry
    });
  }

  async isRefreshTokenValid(userId: string, tokenId: string): Promise<boolean> {
    const entry = this.storage.get(`refresh:${userId}:${tokenId}`);
    if (!entry) return false;
    
    if (entry.expiry && Date.now() > entry.expiry) {
      this.storage.delete(`refresh:${userId}:${tokenId}`);
      return false;
    }
    
    return entry.value === 'true';
  }

  async deleteRefreshToken(userId: string, tokenId: string): Promise<void> {
    this.storage.delete(`refresh:${userId}:${tokenId}`);
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    const keysToDelete: string[] = [];
    for (const key of this.storage.keys()) {
      if (key.startsWith(`refresh:${userId}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.storage.delete(key));
  }

  // Cleanup expired entries periodically
  private cleanup() {
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

export const mockRedisService = new MockRedisService();
export default mockRedisService;