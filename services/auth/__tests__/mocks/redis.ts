// Mock Redis service for testing
class MockRedisService {
  private store: Map<string, { value: string; expiry?: number }> = new Map();
  private isConnected = false;

  async connect(): Promise<void> {
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.store.clear();
  }

  async setSession(sessionId: string, sessionData: any, expirationSeconds: number): Promise<void> {
    const expiry = Date.now() + (expirationSeconds * 1000);
    this.store.set(`session:${sessionId}`, {
      value: JSON.stringify(sessionData),
      expiry,
    });
  }

  async getSession(sessionId: string): Promise<any | null> {
    const entry = this.store.get(`session:${sessionId}`);
    if (!entry) return null;
    
    if (entry.expiry && Date.now() > entry.expiry) {
      this.store.delete(`session:${sessionId}`);
      return null;
    }
    
    return JSON.parse(entry.value);
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.store.delete(`session:${sessionId}`);
  }

  async setBlacklistedToken(tokenId: string, expirationSeconds: number): Promise<void> {
    const expiry = Date.now() + (expirationSeconds * 1000);
    this.store.set(`blacklist:${tokenId}`, {
      value: 'true',
      expiry,
    });
  }

  async isTokenBlacklisted(tokenId: string): Promise<boolean> {
    const entry = this.store.get(`blacklist:${tokenId}`);
    if (!entry) return false;
    
    if (entry.expiry && Date.now() > entry.expiry) {
      this.store.delete(`blacklist:${tokenId}`);
      return false;
    }
    
    return entry.value === 'true';
  }

  async setRefreshToken(userId: string, tokenId: string, expirationSeconds: number): Promise<void> {
    const expiry = Date.now() + (expirationSeconds * 1000);
    this.store.set(`refresh:${userId}:${tokenId}`, {
      value: 'true',
      expiry,
    });
  }

  async isRefreshTokenValid(userId: string, tokenId: string): Promise<boolean> {
    const entry = this.store.get(`refresh:${userId}:${tokenId}`);
    if (!entry) return false;
    
    if (entry.expiry && Date.now() > entry.expiry) {
      this.store.delete(`refresh:${userId}:${tokenId}`);
      return false;
    }
    
    return entry.value === 'true';
  }

  async deleteRefreshToken(userId: string, tokenId: string): Promise<void> {
    this.store.delete(`refresh:${userId}:${tokenId}`);
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    const keysToDelete: string[] = [];
    for (const key of this.store.keys()) {
      if (key.startsWith(`refresh:${userId}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.store.delete(key));
  }

  // Mock Redis client methods for testing
  get client() {
    return {
      keys: async (pattern: string): Promise<string[]> => {
        const keys: string[] = [];
        for (const key of this.store.keys()) {
          if (pattern === '*' || key.includes(pattern.replace('*', ''))) {
            keys.push(key);
          }
        }
        return keys;
      },
      del: async (keys: string[]): Promise<void> => {
        keys.forEach(key => this.store.delete(key));
      },
    };
  }
}

export const mockRedisService = new MockRedisService();
export default mockRedisService;