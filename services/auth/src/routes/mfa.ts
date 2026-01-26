import { Router, Request, Response } from 'express';
import authService from '../services/auth';
import { authenticateToken } from '../middleware/auth';
import { mfaVerificationSchema, validateRequest } from '../validation/schemas';

const router = Router();

// Setup MFA - generates QR code and backup codes
router.post('/setup', authenticateToken, async (req: Request, res: Response) => {
  try {
    const mfaSetup = await authService.setupMFA(req.user!.userId);
    
    if (!mfaSetup) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }

    res.json({
      success: true,
      data: mfaSetup,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'MFA_SETUP_ERROR',
        message: 'An error occurred while setting up MFA',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

// Enable MFA - verifies TOTP code and enables MFA
router.post('/enable',
  authenticateToken,
  validateRequest(mfaVerificationSchema),
  async (req: Request, res: Response) => {
    try {
      const { totpCode } = req.body;
      
      const success = await authService.enableMFA(req.user!.userId, totpCode);
      
      if (!success) {
        return res.status(400).json({
          error: {
            code: 'INVALID_TOTP_CODE',
            message: 'Invalid TOTP code or MFA not set up',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
      }

      res.json({
        success: true,
        message: 'MFA enabled successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'MFA_ENABLE_ERROR',
          message: 'An error occurred while enabling MFA',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }
  }
);

// Disable MFA - verifies TOTP code and disables MFA
router.post('/disable',
  authenticateToken,
  validateRequest(mfaVerificationSchema),
  async (req: Request, res: Response) => {
    try {
      const { totpCode } = req.body;
      
      const success = await authService.disableMFA(req.user!.userId, totpCode);
      
      if (!success) {
        return res.status(400).json({
          error: {
            code: 'INVALID_TOTP_CODE',
            message: 'Invalid TOTP code',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
      }

      res.json({
        success: true,
        message: 'MFA disabled successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'MFA_DISABLE_ERROR',
          message: 'An error occurred while disabling MFA',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }
  }
);

// Get MFA status
router.get('/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await authService.getUserById(req.user!.userId);
    
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }

    res.json({
      success: true,
      data: {
        mfaEnabled: user.mfaEnabled,
        mfaConfigured: !!user.mfaSecret,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'MFA_STATUS_ERROR',
        message: 'An error occurred while fetching MFA status',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

export default router;