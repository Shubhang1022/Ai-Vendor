import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import config from '../config';
import authService from '../services/auth';
import { authenticateToken } from '../middleware/auth';
import rbacService from '../middleware/rbac';
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  changePasswordSchema,
  mfaVerificationSchema,
  validateRequest,
} from '../validation/schemas';

const router = Router();

// Rate limiting for authentication endpoints
const authRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login endpoint
router.post('/login', authRateLimit, validateRequest(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, totpCode } = req.body;
    
    const tokens = await authService.authenticate({ email, password, totpCode });
    
    if (!tokens) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email, password, or MFA code',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }

    res.json({
      success: true,
      data: tokens,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error.message === 'MFA_REQUIRED') {
      return res.status(400).json({
        error: {
          code: 'MFA_REQUIRED',
          message: 'Multi-factor authentication code is required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }

    if (error.message === 'MFA_NOT_CONFIGURED') {
      return res.status(500).json({
        error: {
          code: 'MFA_NOT_CONFIGURED',
          message: 'MFA is enabled but not properly configured',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'An error occurred during authentication',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

// Refresh token endpoint
router.post('/refresh', validateRequest(refreshTokenSchema), async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    const tokens = await authService.refreshToken(refreshToken);
    
    if (!tokens) {
      return res.status(401).json({
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }

    res.json({
      success: true,
      data: tokens,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'TOKEN_REFRESH_ERROR',
        message: 'An error occurred while refreshing the token',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      await authService.logout(token);
    }

    res.json({
      success: true,
      message: 'Successfully logged out',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'LOGOUT_ERROR',
        message: 'An error occurred during logout',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

// Register endpoint (admin only)
router.post('/register', 
  authenticateToken,
  rbacService.requirePermission({ resource: 'user-management', action: 'write' }),
  validateRequest(registerSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password, roles = ['vendor'] } = req.body;
      
      const user = await authService.createUser(email, password, roles);
      
      if (!user) {
        return res.status(409).json({
          error: {
            code: 'USER_EXISTS',
            message: 'A user with this email already exists',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
      }

      // Remove sensitive data from response
      const { passwordHash, mfaSecret, ...safeUser } = user;

      res.status(201).json({
        success: true,
        data: safeUser,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'REGISTRATION_ERROR',
          message: 'An error occurred during user registration',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }
  }
);

// Get current user profile
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await authService.getUserById(req.user!.userId);
    
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }

    // Remove sensitive data from response
    const { passwordHash, mfaSecret, ...safeUser } = user;

    res.json({
      success: true,
      data: safeUser,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'PROFILE_ERROR',
        message: 'An error occurred while fetching user profile',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

// Change password
router.post('/change-password',
  authenticateToken,
  validateRequest(changePasswordSchema),
  async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const success = await authService.updateUserPassword(
        req.user!.userId,
        currentPassword,
        newPassword
      );
      
      if (!success) {
        return res.status(400).json({
          error: {
            code: 'INVALID_CURRENT_PASSWORD',
            message: 'Current password is incorrect',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
      }

      res.json({
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'PASSWORD_CHANGE_ERROR',
          message: 'An error occurred while changing password',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }
  }
);

export default router;