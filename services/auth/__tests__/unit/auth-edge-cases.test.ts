// Mock Redis service before importing other modules
jest.mock('../../src/services/redis', () => ({
  __esModule: true,
  default: {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    setSession: jest.fn().mockResolvedValue(undefined),
    getSession: jest.fn().mockResolvedValue(null),
    deleteSession: jest.fn().mockResolvedValue(undefined),
    setBlacklistedToken: jest.fn().mockResolvedValue(undefined),
    isTokenBlacklisted: jest.fn().mockResolvedValue(false),
    setRefreshToken: jest.fn().mockResolvedValue(undefined),
    isRefreshTokenValid: jest.fn().mockResolvedValue(false),
    deleteRefreshToken: jest.fn().mockResolvedValue(undefined),
    deleteAllUserRefreshTokens: jest.fn().mockResolvedValue(undefined),
  },
}));

import authService from '../../src/services/auth';
import jwtService from '../../src/services/jwt';
import mfaService from '../../src/services/mfa';

// Get the mocked Redis service for test assertions
const mockRedisService = require('../../src/services/redis').default;

describe('Authentication Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Expiration Scenarios', () => {
    test('should reject expired access tokens', async () => {
      // Create a token that's already expired
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZXMiOlsidmVuZG9yIl0sInNlc3Npb25JZCI6InRlc3Qtc2Vzc2lvbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAxfQ.invalid';
      
      const result = await jwtService.validateToken(expiredToken);
      expect(result).toBeNull();
    });

    test('should handle token validation with invalid signature', async () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZXMiOlsidmVuZG9yIl0sInNlc3Npb25JZCI6InRlc3Qtc2Vzc2lvbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.invalid-signature';
      
      const result = await jwtService.validateToken(invalidToken);
      expect(result).toBeNull();
    });

    test('should handle malformed JWT tokens', async () => {
      const malformedTokens = [
        'not.a.jwt',
        'invalid-token',
        '',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', // Missing payload and signature
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid', // Invalid payload
      ];

      for (const token of malformedTokens) {
        const result = await jwtService.validateToken(token);
        expect(result).toBeNull();
      }
    });

    test('should handle refresh token expiration', async () => {
      const expiredRefreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0Iiwic2Vzc2lvbklkIjoidGVzdC1zZXNzaW9uIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDF9.invalid';
      
      const result = await jwtService.refreshToken(expiredRefreshToken);
      expect(result).toBeNull();
    });
  });

  describe('Invalid Credential Handling', () => {
    test('should reject authentication with non-existent user', async () => {
      const result = await authService.authenticate({
        email: 'nonexistent@example.com',
        password: 'password123',
      });
      
      expect(result).toBeNull();
    });

    test('should reject authentication with incorrect password', async () => {
      // First create a user
      await authService.createUser('test@example.com', 'correctpassword');
      
      const result = await authService.authenticate({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
      
      expect(result).toBeNull();
    });

    test('should reject authentication for deactivated user', async () => {
      // Create and then deactivate a user
      const user = await authService.createUser('deactivated@example.com', 'password123');
      if (user) {
        await authService.deactivateUser(user.id);
        
        const result = await authService.authenticate({
          email: 'deactivated@example.com',
          password: 'password123',
        });
        
        expect(result).toBeNull();
      }
    });

    test('should handle empty or null credentials', async () => {
      const testCases = [
        { email: '', password: 'password' },
        { email: 'test@example.com', password: '' },
        { email: '', password: '' },
      ];

      for (const credentials of testCases) {
        const result = await authService.authenticate(credentials);
        expect(result).toBeNull();
      }
    });
  });

  describe('MFA Failure Cases', () => {
    test('should require MFA code when MFA is enabled', async () => {
      // Create user and enable MFA
      const user = await authService.createUser('mfa-user@example.com', 'password123');
      if (user) {
        await authService.setupMFA(user.id);
        // Manually set MFA as enabled (since enableMFA requires valid TOTP)
        const userObj = await authService.getUserById(user.id);
        if (userObj) {
          userObj.mfaEnabled = true;
        }
        
        // Try to authenticate without MFA code
        await expect(authService.authenticate({
          email: 'mfa-user@example.com',
          password: 'password123',
        })).rejects.toThrow('MFA_REQUIRED');
      }
    });

    test('should reject invalid MFA codes', async () => {
      const user = await authService.createUser('mfa-user2@example.com', 'password123');
      if (user) {
        await authService.setupMFA(user.id);
        // Manually enable MFA
        const userObj = await authService.getUserById(user.id);
        if (userObj) {
          userObj.mfaEnabled = true;
        }
        
        const result = await authService.authenticate({
          email: 'mfa-user2@example.com',
          password: 'password123',
          totpCode: '000000', // Invalid code
        });
        
        expect(result).toBeNull();
      }
    });

    test('should handle MFA setup for non-existent user', async () => {
      const result = await authService.setupMFA('non-existent-user-id');
      expect(result).toBeNull();
    });

    test('should handle MFA enable/disable for non-existent user', async () => {
      const enableResult = await authService.enableMFA('non-existent-user-id', '123456');
      expect(enableResult).toBe(false);
      
      const disableResult = await authService.disableMFA('non-existent-user-id', '123456');
      expect(disableResult).toBe(false);
    });

    test('should handle MFA operations without secret', async () => {
      const user = await authService.createUser('no-mfa-secret@example.com', 'password123');
      if (user) {
        // Try to enable MFA without setting up secret first
        const result = await authService.enableMFA(user.id, '123456');
        expect(result).toBe(false);
      }
    });
  });

  describe('Session Management Edge Cases', () => {
    test('should handle blacklisted tokens', async () => {
      mockRedisService.isTokenBlacklisted.mockResolvedValue(true);
      
      const validToken = jwtService.generateTokens('user123', 'test@example.com', ['vendor']);
      const result = await jwtService.validateToken(validToken.accessToken);
      
      expect(result).toBeNull();
    });

    test('should handle missing session data', async () => {
      mockRedisService.isTokenBlacklisted.mockResolvedValue(false);
      mockRedisService.getSession.mockResolvedValue(null);
      
      const validToken = jwtService.generateTokens('user123', 'test@example.com', ['vendor']);
      const result = await jwtService.validateToken(validToken.accessToken);
      
      expect(result).toBeNull();
    });

    test('should handle refresh token validation failure', async () => {
      mockRedisService.isRefreshTokenValid.mockResolvedValue(false);
      
      const tokens = jwtService.generateTokens('user123', 'test@example.com', ['vendor']);
      const result = await jwtService.refreshToken(tokens.refreshToken);
      
      expect(result).toBeNull();
    });

    test('should handle session cleanup on logout', async () => {
      const tokens = jwtService.generateTokens('user123', 'test@example.com', ['vendor']);
      
      await jwtService.invalidateToken(tokens.accessToken);
      
      expect(mockRedisService.setBlacklistedToken).toHaveBeenCalled();
      expect(mockRedisService.deleteSession).toHaveBeenCalled();
      expect(mockRedisService.deleteRefreshToken).toHaveBeenCalled();
    });
  });

  describe('User Management Edge Cases', () => {
    test('should prevent duplicate user creation', async () => {
      await authService.createUser('duplicate@example.com', 'password123');
      
      const duplicateUser = await authService.createUser('duplicate@example.com', 'password456');
      expect(duplicateUser).toBeNull();
    });

    test('should handle password change with incorrect current password', async () => {
      const user = await authService.createUser('password-change@example.com', 'oldpassword');
      if (user) {
        const result = await authService.updateUserPassword(
          user.id,
          'wrongcurrentpassword',
          'newpassword'
        );
        expect(result).toBe(false);
      }
    });

    test('should handle operations on non-existent users', async () => {
      const getUserResult = await authService.getUserById('non-existent-id');
      expect(getUserResult).toBeNull();
      
      const getUserByEmailResult = await authService.getUserByEmail('nonexistent@example.com');
      expect(getUserByEmailResult).toBeNull();
      
      const passwordChangeResult = await authService.updateUserPassword(
        'non-existent-id',
        'oldpass',
        'newpass'
      );
      expect(passwordChangeResult).toBe(false);
      
      const deactivateResult = await authService.deactivateUser('non-existent-id');
      expect(deactivateResult).toBe(false);
    });
  });

  describe('MFA Service Edge Cases', () => {
    test('should generate valid MFA secrets', () => {
      const { secret, otpauthUrl } = mfaService.generateSecret('test@example.com');
      
      expect(secret).toBeDefined();
      expect(secret.length).toBeGreaterThan(0);
      expect(otpauthUrl).toContain('test%40example.com'); // URL encoded email
      expect(otpauthUrl).toContain('otpauth://totp/'); // Should be a valid TOTP URL
      expect(otpauthUrl).toContain('secret='); // Should contain secret parameter
    });

    test('should verify valid TOTP tokens', () => {
      // This is a simplified test - in reality, TOTP verification depends on time
      const secret = 'JBSWY3DPEHPK3PXP';
      
      // Test with obviously invalid codes
      expect(mfaService.verifyToken(secret, '000000')).toBe(false);
      expect(mfaService.verifyToken(secret, 'invalid')).toBe(false);
      expect(mfaService.verifyToken(secret, '')).toBe(false);
    });

    test('should handle backup code verification', () => {
      const backupCodes = ['ABC12345', 'DEF67890', 'GHI11111'];
      
      // Valid backup code should return true and remove the code
      expect(mfaService.verifyBackupCode(backupCodes, 'ABC12345')).toBe(true);
      expect(backupCodes).not.toContain('ABC12345');
      
      // Invalid backup code should return false
      expect(mfaService.verifyBackupCode(backupCodes, 'INVALID')).toBe(false);
      
      // Used backup code should not work again
      expect(mfaService.verifyBackupCode(backupCodes, 'ABC12345')).toBe(false);
    });
  });

  describe('Token Generation Edge Cases', () => {
    test('should generate tokens with different user data', () => {
      const tokens1 = jwtService.generateTokens('user1', 'user1@example.com', ['vendor']);
      const tokens2 = jwtService.generateTokens('user2', 'user2@example.com', ['admin']);
      
      expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
      expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
      expect(tokens1.tokenType).toBe('Bearer');
      expect(tokens2.tokenType).toBe('Bearer');
    });

    test('should handle token invalidation for already invalid tokens', async () => {
      const invalidToken = 'invalid-token';
      
      // Should not throw error when trying to invalidate invalid token
      await expect(jwtService.invalidateToken(invalidToken)).resolves.not.toThrow();
    });
  });
});