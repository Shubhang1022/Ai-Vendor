import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { LoginCredentials, AuthToken, User, MFASetupResponse } from '../types/auth';
import jwtService from './jwt';
import mfaService from './mfa';
import redisService from './redis';

class AuthService {
  private users: Map<string, User> = new Map(); // In-memory store for demo - replace with database

  constructor() {
    this.initializeDefaultUsers();
  }

  private async initializeDefaultUsers(): Promise<void> {
    // Create default admin user
    const adminUser: User = {
      id: uuidv4(),
      email: 'admin@vendorplatform.com',
      passwordHash: await bcrypt.hash('admin123', config.bcrypt.saltRounds),
      roles: [{ id: 'admin', name: 'admin', permissions: [] }],
      mfaEnabled: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create default vendor user
    const vendorUser: User = {
      id: uuidv4(),
      email: 'vendor@example.com',
      passwordHash: await bcrypt.hash('vendor123', config.bcrypt.saltRounds),
      roles: [{ id: 'vendor', name: 'vendor', permissions: [] }],
      mfaEnabled: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(adminUser.email, adminUser);
    this.users.set(vendorUser.email, vendorUser);
  }

  async authenticate(credentials: LoginCredentials): Promise<AuthToken | null> {
    const user = this.users.get(credentials.email);
    
    if (!user || !user.isActive) {
      return null;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    // Check MFA if enabled
    if (user.mfaEnabled) {
      if (!credentials.totpCode) {
        throw new Error('MFA_REQUIRED');
      }

      if (!user.mfaSecret) {
        throw new Error('MFA_NOT_CONFIGURED');
      }

      const isMFAValid = mfaService.verifyToken(user.mfaSecret, credentials.totpCode);
      if (!isMFAValid) {
        return null;
      }
    }

    // Generate tokens
    const tokens = jwtService.generateTokens(
      user.id,
      user.email,
      user.roles.map(role => role.name)
    );

    // Store session in Redis
    const sessionData = {
      userId: user.id,
      email: user.email,
      roles: user.roles.map(role => role.name),
    };

    const sessionId = this.extractSessionId(tokens.accessToken);
    await redisService.setSession(
      sessionId,
      sessionData,
      tokens.expiresIn
    );

    // Store refresh token
    await redisService.setRefreshToken(
      user.id,
      sessionId,
      this.parseExpirationTime(config.jwtRefreshExpiresIn)
    );

    return tokens;
  }

  async refreshToken(refreshToken: string): Promise<AuthToken | null> {
    return jwtService.refreshToken(refreshToken);
  }

  async logout(token: string): Promise<void> {
    await jwtService.invalidateToken(token);
  }

  async setupMFA(userId: string): Promise<MFASetupResponse | null> {
    const user = this.findUserById(userId);
    if (!user) {
      return null;
    }

    const mfaSetup = await mfaService.setupMFA(user.email);
    
    // Store MFA secret (in production, this should be encrypted)
    user.mfaSecret = mfaSetup.secret;
    user.updatedAt = new Date();

    return mfaSetup;
  }

  async enableMFA(userId: string, totpCode: string): Promise<boolean> {
    const user = this.findUserById(userId);
    if (!user || !user.mfaSecret) {
      return false;
    }

    const isValid = mfaService.verifyToken(user.mfaSecret, totpCode);
    if (!isValid) {
      return false;
    }

    user.mfaEnabled = true;
    user.updatedAt = new Date();
    
    return true;
  }

  async disableMFA(userId: string, totpCode: string): Promise<boolean> {
    const user = this.findUserById(userId);
    if (!user || !user.mfaSecret) {
      return false;
    }

    const isValid = mfaService.verifyToken(user.mfaSecret, totpCode);
    if (!isValid) {
      return false;
    }

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    user.updatedAt = new Date();
    
    return true;
  }

  async createUser(email: string, password: string, roles: string[] = ['vendor']): Promise<User | null> {
    if (this.users.has(email)) {
      return null; // User already exists
    }

    const passwordHash = await bcrypt.hash(password, config.bcrypt.saltRounds);
    
    const user: User = {
      id: uuidv4(),
      email,
      passwordHash,
      roles: roles.map(roleName => ({ id: roleName, name: roleName, permissions: [] })),
      mfaEnabled: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(email, user);
    return user;
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.findUserById(userId);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.get(email) || null;
  }

  async updateUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = this.findUserById(userId);
    if (!user) {
      return false;
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return false;
    }

    user.passwordHash = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
    user.updatedAt = new Date();
    
    return true;
  }

  async deactivateUser(userId: string): Promise<boolean> {
    const user = this.findUserById(userId);
    if (!user) {
      return false;
    }

    user.isActive = false;
    user.updatedAt = new Date();
    
    // Invalidate all user sessions
    await redisService.deleteAllUserRefreshTokens(userId);
    
    return true;
  }

  private findUserById(userId: string): User | null {
    for (const user of this.users.values()) {
      if (user.id === userId) {
        return user;
      }
    }
    return null;
  }

  private extractSessionId(token: string): string {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return payload.sessionId;
    } catch {
      return '';
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
      default: return 604800; // 7 days default
    }
  }
}

export const authService = new AuthService();
export default authService;